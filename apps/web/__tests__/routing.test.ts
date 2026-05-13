import { describe, expect, it } from 'vitest';

import { canonicalUrl, hreflangLanguages, hubUrl, permalinkUrl } from '../lib/routing.js';

describe('routing', () => {
  describe('canonicalUrl', () => {
    it('returns base for EN home', () => {
      expect(canonicalUrl({ locale: 'en', path: '/' })).toBe('https://thebriefyard.com');
    });

    it('returns /pt for PT home', () => {
      expect(canonicalUrl({ locale: 'pt', path: '/' })).toBe('https://thebriefyard.com/pt');
    });

    it('returns hub URL without locale prefix for EN', () => {
      expect(canonicalUrl({ locale: 'en', path: '/brief/logo/food' })).toBe(
        'https://thebriefyard.com/brief/logo/food',
      );
    });

    it('returns hub URL with /pt prefix for PT', () => {
      expect(canonicalUrl({ locale: 'pt', path: '/brief/logo/food' })).toBe(
        'https://thebriefyard.com/pt/brief/logo/food',
      );
    });
  });

  describe('hreflangLanguages', () => {
    it('emits both locales for the home', () => {
      const langs = hreflangLanguages('/');
      expect(langs.en).toBe('https://thebriefyard.com');
      expect(langs.pt).toBe('https://thebriefyard.com/pt');
    });

    it('emits both locales for a hub', () => {
      const langs = hreflangLanguages('/brief/logo/food');
      expect(langs.en).toBe('https://thebriefyard.com/brief/logo/food');
      expect(langs.pt).toBe('https://thebriefyard.com/pt/brief/logo/food');
    });
  });

  describe('hubUrl + permalinkUrl', () => {
    it('hubUrl assembles the path', () => {
      expect(hubUrl({ locale: 'en', job: 'logo', industry: 'food' })).toBe(
        'https://thebriefyard.com/brief/logo/food',
      );
    });

    it('permalinkUrl includes seed', () => {
      expect(permalinkUrl({ locale: 'en', job: 'logo', industry: 'food', seed: 'a7f3c2' })).toBe(
        'https://thebriefyard.com/brief/logo/food/a7f3c2',
      );
    });
  });
});
