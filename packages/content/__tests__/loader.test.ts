import { describe, expect, it } from 'vitest';

import { readCorpus } from '../src/loader.js';
import { CONTENT_VERSION } from '../version.js';

describe('readCorpus', () => {
  it('loads the EN 1x1 corpus and returns a CompiledCorpus', () => {
    const corpus = readCorpus('en');
    expect(corpus.contentVersion).toBe(CONTENT_VERSION);
    expect(corpus.locale).toBe('en');
    expect(corpus.industries.food).toBeDefined();
    expect(corpus.jobs.logo).toBeDefined();
    expect(Object.keys(corpus.sharedSlots)).toContain('audiences');
    expect(Object.keys(corpus.sharedSlots)).toContain('deadlines');
    expect(Object.keys(corpus.sharedSlots)).toContain('emotions');
    expect(Object.keys(corpus.sharedSlots)).toContain('name-prefix');
    expect(Object.keys(corpus.sharedSlots)).toContain('name-core');
    expect(Object.keys(corpus.sharedSlots)).toContain('name-suffix');
  });

  it('food industry placeholders all resolve from industry.slots or sharedSlots', () => {
    const corpus = readCorpus('en');
    const food = corpus.industries.food;
    expect(food).toBeDefined();
    const placeholders = food!.templates.flatMap((t) =>
      [...t.pattern.matchAll(/\{\{(\w[\w-]*)\}\}/g)].map((m) => m[1]!),
    );
    expect(placeholders.length).toBeGreaterThan(0);
    for (const p of placeholders) {
      expect(food!.slots[p] ?? corpus.sharedSlots[p]).toBeDefined();
    }
  });

  it('logo job placeholders all resolve from jobSlots or sharedSlots', () => {
    const corpus = readCorpus('en');
    const logo = corpus.jobs.logo;
    expect(logo).toBeDefined();
    const placeholders = logo!.jobDescriptionTemplates.flatMap((t) =>
      [...t.pattern.matchAll(/\{\{(\w[\w-]*)\}\}/g)].map((m) => m[1]!),
    );
    expect(placeholders.length).toBeGreaterThan(0);
    for (const p of placeholders) {
      expect(logo!.jobSlots[p] ?? corpus.sharedSlots[p]).toBeDefined();
    }
  });
});
