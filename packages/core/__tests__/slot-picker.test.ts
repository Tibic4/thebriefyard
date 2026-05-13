import { describe, expect, it } from 'vitest';

import { mulberry32 } from '../src/prng.js';
import { pickWeighted } from '../src/slot-picker.js';

describe('pickWeighted', () => {
  it('picks an element from the array', () => {
    const rng = mulberry32(1);
    const items = [
      { text: 'a', weight: 1 },
      { text: 'b', weight: 1 },
    ];
    const picked = pickWeighted(items, rng);
    expect(['a', 'b']).toContain(picked.text);
  });

  it('respects weights — item with weight 99 dominates over 1', () => {
    const rng = mulberry32(7);
    const items = [
      { text: 'rare', weight: 1 },
      { text: 'common', weight: 99 },
    ];
    const counts: Record<'rare' | 'common', number> = { rare: 0, common: 0 };
    for (let i = 0; i < 1000; i++) {
      counts[pickWeighted(items, rng).text as 'rare' | 'common']++;
    }
    expect(counts.common).toBeGreaterThan(counts.rare * 5);
  });

  it('throws on an empty array', () => {
    const rng = mulberry32(1);
    expect(() => pickWeighted([], rng)).toThrow();
  });

  it('is deterministic for the same RNG sequence', () => {
    const items = [
      { text: 'a', weight: 1 },
      { text: 'b', weight: 1 },
      { text: 'c', weight: 1 },
    ];
    const a = pickWeighted(items, mulberry32(99));
    const b = pickWeighted(items, mulberry32(99));
    expect(a.text).toBe(b.text);
  });

  it('returns the last item via floating-point fallback when rng() yields exactly 1', () => {
    const items = [
      { text: 'a', weight: 1 },
      { text: 'b', weight: 1 },
    ];
    // rng()*total === total → r never goes negative in the loop, fallback fires.
    const rng = (): number => 1;
    const picked = pickWeighted(items, rng);
    expect(picked.text).toBe('b');
  });
});
