import { describe, expect, it } from 'vitest';

import { Brief, IndustryFile, JobFile, SlotEntry, CONTENT_VERSION } from '../src/index.js';

describe('@briefyard/content smoke', () => {
  it('exposes CONTENT_VERSION at 2 (P2-stub bump for schema introduction)', () => {
    expect(CONTENT_VERSION).toBe(2);
  });

  it('exposes the four canonical Zod schemas', () => {
    expect(SlotEntry).toBeDefined();
    expect(IndustryFile).toBeDefined();
    expect(JobFile).toBeDefined();
    expect(Brief).toBeDefined();
  });

  it('SlotEntry parses a minimal valid entry with default weight', () => {
    const parsed = SlotEntry.parse({ text: 'sample' });
    expect(parsed.weight).toBe(1);
    expect(parsed.text).toBe('sample');
  });

  it('SlotEntry accepts empty text (name-prefix/suffix sentinel for "absent token")', () => {
    expect(SlotEntry.safeParse({ text: '' }).success).toBe(true);
  });

  it('SlotEntry rejects text over 280 chars', () => {
    const long = 'a'.repeat(281);
    expect(SlotEntry.safeParse({ text: long }).success).toBe(false);
  });
});
