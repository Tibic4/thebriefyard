import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { IndustryFile, JobFile, SlotEntry } from '../src/schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesRoot = join(__dirname, '..', 'locales');

const SlotArray = z.array(SlotEntry);
const UiDict = z.record(z.string(), z.string());

interface FileSpec {
  file: string;
  schema: z.ZodTypeAny;
  label: string;
}

function collect(locale: string): FileSpec[] {
  const root = join(localesRoot, locale);
  const out: FileSpec[] = [];

  const slotsDir = join(root, 'slots');
  for (const f of readdirSync(slotsDir)) {
    if (f.endsWith('.json'))
      out.push({ file: join(slotsDir, f), schema: SlotArray, label: 'slot' });
  }
  const industriesDir = join(root, 'industries');
  for (const f of readdirSync(industriesDir)) {
    if (f.endsWith('.json'))
      out.push({ file: join(industriesDir, f), schema: IndustryFile, label: 'industry' });
  }
  const jobsDir = join(root, 'jobs');
  for (const f of readdirSync(jobsDir)) {
    if (f.endsWith('.json')) out.push({ file: join(jobsDir, f), schema: JobFile, label: 'job' });
  }
  out.push({ file: join(root, 'ui.json'), schema: UiDict, label: 'ui' });
  return out;
}

describe('schema-valid (EN)', () => {
  for (const spec of collect('en')) {
    it(`${spec.label}: ${spec.file.replace(localesRoot, '')} parses against schema`, () => {
      const raw = readFileSync(spec.file, 'utf8');
      const data: unknown = JSON.parse(raw);
      const result = spec.schema.safeParse(data);
      if (!result.success) {
        throw new Error(
          `${spec.file} failed schema validation:\n${JSON.stringify(result.error.format(), null, 2)}`,
        );
      }
      expect(result.success).toBe(true);
    });
  }
});
