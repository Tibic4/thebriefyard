import { describe, expect, it } from 'vitest';

import { mulberry32 } from '../src/prng.js';

describe('mulberry32', () => {
  it('returns a function that yields values in [0, 1)', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('is deterministic — same seed yields the same sequence', () => {
    const a = mulberry32(123456);
    const b = mulberry32(123456);
    for (let i = 0; i < 1000; i++) {
      expect(a()).toBe(b());
    }
  });

  it('different seeds yield different first values', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it('passes a coarse chi-squared uniformity test on 10,000 draws across 10 buckets', () => {
    const rng = mulberry32(0xdeadbeef);
    const buckets = new Array<number>(10).fill(0);
    const N = 10_000;
    for (let i = 0; i < N; i++) {
      const idx = Math.floor(rng() * 10);
      buckets[idx]!++;
    }
    const expected = N / 10;
    const chi = buckets.reduce((acc, observed) => {
      const diff = observed - expected;
      return acc + (diff * diff) / expected;
    }, 0);
    // df=9, alpha=0.001 critical ≈ 27.88; accept anything below 30
    expect(chi).toBeLessThan(30);
  });
});
