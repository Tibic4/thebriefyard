import { Brief } from '@briefyard/content';
import { describe, expect, it } from 'vitest';

import { generateBrief } from '../src/generate.js';

describe('generateBrief', () => {
  it('produces a valid Brief for (logo, food, en, seed=a7f3c2)', () => {
    const brief = generateBrief({
      job: 'logo',
      industry: 'food',
      locale: 'en',
      seed: 'a7f3c2',
    });
    const parsed = Brief.safeParse(brief);
    if (!parsed.success) {
      console.error(JSON.stringify(parsed.error.format(), null, 2));
    }
    expect(parsed.success).toBe(true);
    expect(brief.seed).toBe('a7f3c2');
    expect(brief.job).toBe('logo');
    expect(brief.industry).toBe('food');
    expect(brief.locale).toBe('en');
  });

  it('generates a fresh seed when none is provided', () => {
    const brief = generateBrief({ job: 'logo', industry: 'food', locale: 'en' });
    expect(brief.seed).toMatch(/^[0-9a-z]{6}$/);
  });

  it('company.name is non-empty after assembling prefix + core + suffix', () => {
    const brief = generateBrief({
      job: 'logo',
      industry: 'food',
      locale: 'en',
      seed: 'aaaaaa',
    });
    expect(brief.company.name.trim().length).toBeGreaterThan(0);
  });

  it('throws when industry is not in corpus', () => {
    expect(() =>
      generateBrief({ job: 'logo', industry: 'tech', locale: 'en', seed: 'aaaaaa' }),
    ).toThrow(/industry/);
  });

  it('throws when job is not in corpus', () => {
    expect(() =>
      generateBrief({ job: 'packaging', industry: 'food', locale: 'en', seed: 'aaaaaa' }),
    ).toThrow(/job/);
  });
});
