import { describe, expect, it } from 'vitest';

import { VERSION } from '../src/index.js';

describe('@briefyard/core smoke', () => {
  it('exposes VERSION constant (P0 placeholder)', () => {
    expect(VERSION).toBe('0.0.0');
  });
});
