import { describe, expect, it } from 'vitest';

import { generateBrief, generateSeed, mulberry32, seedToInt } from '../src/index.js';

describe('@briefyard/core public API', () => {
  it('exposes generateBrief, generateSeed, seedToInt, mulberry32', () => {
    expect(typeof generateBrief).toBe('function');
    expect(typeof generateSeed).toBe('function');
    expect(typeof seedToInt).toBe('function');
    expect(typeof mulberry32).toBe('function');
  });
});
