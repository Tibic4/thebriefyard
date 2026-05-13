import { describe, expect, it } from 'vitest';

import { generateBrief } from '../src/generate.js';

describe('determinism', () => {
  it('the same input produces a byte-identical Brief 100 times', () => {
    const reference = generateBrief({
      job: 'logo',
      industry: 'food',
      locale: 'en',
      seed: 'reg001',
    });
    const referenceJson = JSON.stringify(reference);
    for (let i = 0; i < 100; i++) {
      const again = generateBrief({
        job: 'logo',
        industry: 'food',
        locale: 'en',
        seed: 'reg001',
      });
      expect(JSON.stringify(again)).toBe(referenceJson);
    }
  });

  it('different seeds produce different briefs (sanity)', () => {
    const a = generateBrief({ job: 'logo', industry: 'food', locale: 'en', seed: 'aaaaaa' });
    const b = generateBrief({ job: 'logo', industry: 'food', locale: 'en', seed: 'bbbbbb' });
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });
});
