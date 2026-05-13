import { describe, expect, it } from 'vitest';

import { readCorpus } from '../src/loader.js';

describe('no-duplicates (EN)', () => {
  it('no non-empty entry text appears in two distinct slot keys', () => {
    const corpus = readCorpus('en');
    // Map text -> array of "scope:slot" labels where it appeared.
    const seen = new Map<string, string[]>();

    function record(slotMap: Record<string, { text: string }[]>, scope: string) {
      for (const [slot, entries] of Object.entries(slotMap)) {
        for (const e of entries) {
          // Empty strings are intentional sentinels (name-prefix, name-suffix).
          if (e.text === '') continue;
          const key = `${scope}:${slot}`;
          const list = seen.get(e.text) ?? [];
          list.push(key);
          seen.set(e.text, list);
        }
      }
    }

    record(corpus.sharedSlots, 'shared');
    record(corpus.industries.food!.slots, 'industry:food');
    record(corpus.jobs.logo!.jobSlots, 'job:logo');

    const collisions = [...seen.entries()].filter(([, labels]) => new Set(labels).size > 1);
    if (collisions.length > 0) {
      const report = collisions
        .map(([text, labels]) => `  "${text}" appears in: ${labels.join(', ')}`)
        .join('\n');
      throw new Error(`Duplicate entry text across slots:\n${report}`);
    }
    expect(collisions).toEqual([]);
  });
});
