import { describe, expect, it } from 'vitest';

import { mulberry32 } from '../src/prng.js';
import { generateSeed, seedToInt } from '../src/seed.js';

describe('seed', () => {
  it('generateSeed produces a 6-char base36 string', () => {
    for (let i = 0; i < 50; i++) {
      const s = generateSeed();
      expect(s).toMatch(/^[0-9a-z]{6}$/);
    }
  });

  it('seedToInt is deterministic for the same string', () => {
    expect(seedToInt('a7f3c2')).toBe(seedToInt('a7f3c2'));
  });

  it('seedToInt produces different ints for different seeds', () => {
    expect(seedToInt('aaaaaa')).not.toBe(seedToInt('bbbbbb'));
  });

  it('seedToInt feeds mulberry32 reproducibly', () => {
    const a = mulberry32(seedToInt('abc123'));
    const b = mulberry32(seedToInt('abc123'));
    expect(a()).toBe(b());
  });
});
