import {
  CONTENT_VERSION,
  readCorpus,
  type Brief,
  type CompiledCorpus,
  type SlotEntry,
} from '@briefyard/content';
import type { IndustryId, JobId, LocaleId } from '@briefyard/types';

import { mulberry32 } from './prng';
import { generateSeed, seedToInt } from './seed';
import { pickWeighted } from './slot-picker';
import { fillTemplate } from './template';

export interface GenerateInput {
  job: JobId;
  industry: IndustryId;
  locale: LocaleId;
  seed?: string;
  contentVersion?: number;
  expanded?: boolean;
}

const corpusCache = new Map<LocaleId, CompiledCorpus>();
function corpusFor(locale: LocaleId): CompiledCorpus {
  let c = corpusCache.get(locale);
  if (!c) {
    c = readCorpus(locale);
    corpusCache.set(locale, c);
  }
  return c;
}

function resolvePlaceholders(
  pattern: string,
  scoped: Record<string, SlotEntry[]>,
  shared: Record<string, SlotEntry[]>,
  rng: () => number,
): Record<string, string> {
  const out: Record<string, string> = {};
  const placeholders = [...pattern.matchAll(/\{\{(\w[\w-]*)\}\}/g)].map((m) => m[1]!);
  for (const key of placeholders) {
    const slot = scoped[key] ?? shared[key];
    if (!slot) {
      throw new Error(`generateBrief: slot "${key}" not found in industry/job/shared`);
    }
    out[key] = pickWeighted(slot, rng).text;
  }
  return out;
}

/**
 * Pure deterministic brief generator. ADR-004.
 *
 * For a fixed (job, industry, locale, seed, contentVersion, expanded), the
 * output is byte-identical across machines and time. `generatedAt` is fixed
 * epoch on purpose — the HTTP layer (P3) replaces it with `Date.now()`
 * outside the pure function before logging.
 */
export function generateBrief(input: GenerateInput): Brief {
  const seed = input.seed ?? generateSeed();
  const contentVersion = input.contentVersion ?? CONTENT_VERSION;
  const rng = mulberry32(seedToInt(seed));
  const corpus = corpusFor(input.locale);

  const industry = corpus.industries[input.industry];
  if (!industry) {
    throw new Error(`generateBrief: industry "${input.industry}" not in corpus`);
  }
  const job = corpus.jobs[input.job];
  if (!job) {
    throw new Error(`generateBrief: job "${input.job}" not in corpus`);
  }

  // Company name: prefix + core + suffix.
  const namePrefix = pickWeighted(corpus.sharedSlots['name-prefix']!, rng).text;
  const nameCore = pickWeighted(corpus.sharedSlots['name-core']!, rng).text;
  const nameSuffix = pickWeighted(corpus.sharedSlots['name-suffix']!, rng).text;
  const name = `${namePrefix}${nameCore}${nameSuffix}`.trim();

  // Industry sentence.
  const industryTemplate = pickWeighted(
    industry.templates.map((t) => ({ text: t.pattern, weight: 1 })),
    rng,
  ).text;
  const industryValues = resolvePlaceholders(
    industryTemplate,
    industry.slots,
    corpus.sharedSlots,
    rng,
  );
  const description = fillTemplate(industryTemplate, industryValues);

  // Job sentence.
  const jobTemplate = pickWeighted(
    job.jobDescriptionTemplates.map((t) => ({ text: t.pattern, weight: 1 })),
    rng,
  ).text;
  const jobValues = resolvePlaceholders(jobTemplate, job.jobSlots, corpus.sharedSlots, rng);
  const jobDescription = fillTemplate(jobTemplate, jobValues);

  const audience = pickWeighted(corpus.sharedSlots['audiences']!, rng).text;
  const deadline = pickWeighted(corpus.sharedSlots['deadlines']!, rng).text;

  return {
    seed,
    job: input.job,
    industry: input.industry,
    locale: input.locale,
    contentVersion,
    company: { name, description, audience },
    deliverable: { description: jobDescription, constraints: [], useCases: [] },
    deadline,
    generatedAt: new Date(0).toISOString(),
  };
}
