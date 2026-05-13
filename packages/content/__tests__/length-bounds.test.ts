import { describe, expect, it } from 'vitest';

import { readCorpus } from '../src/loader.js';

describe('length-bounds (EN)', () => {
  const corpus = readCorpus('en');

  function entriesOf(slotMap: Record<string, { text: string }[]>, scope: string) {
    const out: { scope: string; slot: string; index: number; text: string }[] = [];
    for (const [slot, entries] of Object.entries(slotMap)) {
      entries.forEach((e, i) => out.push({ scope, slot, index: i, text: e.text }));
    }
    return out;
  }

  const all = [
    ...entriesOf(corpus.sharedSlots, 'shared'),
    ...entriesOf(corpus.industries.food!.slots, 'industry:food'),
    ...entriesOf(corpus.jobs.logo!.jobSlots, 'job:logo'),
  ];

  it('found a non-trivial number of entries to check', () => {
    expect(all.length).toBeGreaterThan(30);
  });

  for (const e of all) {
    it(`${e.scope}/${e.slot}[${e.index}] text length is within 0..280`, () => {
      expect(e.text.length).toBeGreaterThanOrEqual(0);
      expect(e.text.length).toBeLessThanOrEqual(280);
    });
  }
});
