import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { IndustryId, JobId, LocaleId } from '@briefyard/types';
import { z } from 'zod';

import { CONTENT_VERSION } from '../version';
import { IndustryFile, JobFile, SlotEntry } from './schema';

export interface CompiledCorpus {
  contentVersion: number;
  locale: LocaleId;
  sharedSlots: Record<string, SlotEntry[]>;
  industries: Partial<Record<IndustryId, IndustryFile>>;
  jobs: Partial<Record<JobId, JobFile>>;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesRoot = join(__dirname, '..', 'locales');

const SlotArray = z.array(SlotEntry);

function parseJson<S extends z.ZodTypeAny>(file: string, schema: S): z.infer<S> {
  const raw = readFileSync(file, 'utf8');
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new Error(`readCorpus: ${file} is not valid JSON: ${(e as Error).message}`);
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`readCorpus: ${file} failed schema validation:\n${result.error.message}`);
  }
  return result.data;
}

export function readCorpus(locale: LocaleId): CompiledCorpus {
  const root = join(localesRoot, locale);

  const sharedSlots: Record<string, SlotEntry[]> = {};
  const slotsDir = join(root, 'slots');
  for (const file of readdirSync(slotsDir)) {
    if (!file.endsWith('.json')) continue;
    const slotKey = file.replace(/\.json$/, '');
    sharedSlots[slotKey] = parseJson(join(slotsDir, file), SlotArray);
  }

  const industries: Partial<Record<IndustryId, IndustryFile>> = {};
  const industriesDir = join(root, 'industries');
  for (const file of readdirSync(industriesDir)) {
    if (!file.endsWith('.json')) continue;
    const parsed: IndustryFile = parseJson(join(industriesDir, file), IndustryFile);
    industries[parsed.id] = parsed;
  }

  const jobs: Partial<Record<JobId, JobFile>> = {};
  const jobsDir = join(root, 'jobs');
  for (const file of readdirSync(jobsDir)) {
    if (!file.endsWith('.json')) continue;
    const parsed: JobFile = parseJson(join(jobsDir, file), JobFile);
    jobs[parsed.id] = parsed;
  }

  return {
    contentVersion: CONTENT_VERSION,
    locale,
    sharedSlots,
    industries,
    jobs,
  };
}
