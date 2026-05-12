import { describe, expect, it } from 'vitest';

import { CONTENT_VERSION } from '../src/index.js';

describe('@briefyard/content smoke', () => {
  it('exposes CONTENT_VERSION starting at 1 (P0 placeholder)', () => {
    expect(CONTENT_VERSION).toBe(1);
  });
});
