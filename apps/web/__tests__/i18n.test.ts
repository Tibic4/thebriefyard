import { describe, expect, it } from 'vitest';

import { defaultLocale, locales } from '../lib/i18n.js';

describe('i18n config', () => {
  it('exports locales = [en, pt]', () => {
    expect([...locales]).toEqual(['en', 'pt']);
  });

  it('defaults to en', () => {
    expect(defaultLocale).toBe('en');
  });
});
