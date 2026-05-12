import { describe, expect, it } from 'vitest';

import { INDUSTRY_IDS, JOB_IDS, LOCALE_IDS, Seed } from '../src/index.js';

describe('types package', () => {
  it('exports exactly 15 job ids matching SPEC §9.2', () => {
    expect(JOB_IDS).toHaveLength(15);
    expect(JOB_IDS).toContain('logo');
    expect(JOB_IDS).toContain('wayfinding');
  });

  it('exports exactly 20 industry ids matching SPEC §9.2', () => {
    expect(INDUSTRY_IDS).toHaveLength(20);
    expect(INDUSTRY_IDS).toContain('tech');
    expect(INDUSTRY_IDS).toContain('automotive');
  });

  it('exports exactly 2 locales matching LD-004', () => {
    expect(LOCALE_IDS).toEqual(['en', 'pt']);
  });

  it('Seed accepts 6-char base36 strings', () => {
    expect(Seed.safeParse('a7f3c2').success).toBe(true);
    expect(Seed.safeParse('000000').success).toBe(true);
  });

  it('Seed rejects malformed strings', () => {
    expect(Seed.safeParse('a7f3c').success).toBe(false);
    expect(Seed.safeParse('a7f3c2g').success).toBe(false);
    expect(Seed.safeParse('A7F3C2').success).toBe(false);
    expect(Seed.safeParse('').success).toBe(false);
  });
});
