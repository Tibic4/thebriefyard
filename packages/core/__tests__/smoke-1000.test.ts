import { Brief } from '@briefyard/content';
import { describe, expect, it } from 'vitest';

import { generateBrief } from '../src/generate.js';
import { generateSeed } from '../src/seed.js';

describe('smoke-1000', () => {
  it('1000 random briefs all pass Brief.parse', () => {
    const failures: string[] = [];
    for (let i = 0; i < 1000; i++) {
      const seed = generateSeed();
      const brief = generateBrief({
        job: 'logo',
        industry: 'food',
        locale: 'en',
        seed,
      });
      const parsed = Brief.safeParse(brief);
      if (!parsed.success) {
        failures.push(`seed=${seed}: ${parsed.error.message}`);
      }
    }
    if (failures.length > 0) {
      throw new Error(
        `smoke-1000 had ${failures.length} failures:\n${failures.slice(0, 10).join('\n')}`,
      );
    }
    expect(failures).toEqual([]);
  });
});
