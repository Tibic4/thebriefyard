import { describe, expect, it } from 'vitest';

import { buildMetadata } from '../lib/seo.js';

describe('buildMetadata', () => {
  it('emits canonical for EN home', () => {
    const md = buildMetadata({ locale: 'en', path: '/' });
    expect(md.alternates?.canonical).toBe('https://thebriefyard.com');
  });

  it('emits canonical for PT home', () => {
    const md = buildMetadata({ locale: 'pt', path: '/' });
    expect(md.alternates?.canonical).toBe('https://thebriefyard.com/pt');
  });

  it('emits hreflang pair for both locales', () => {
    const md = buildMetadata({ locale: 'en', path: '/brief/logo/food' });
    expect(md.alternates?.languages?.en).toBe('https://thebriefyard.com/brief/logo/food');
    expect(md.alternates?.languages?.pt).toBe('https://thebriefyard.com/pt/brief/logo/food');
  });

  it('respects noindex flag', () => {
    const md = buildMetadata({
      locale: 'en',
      path: '/brief/logo/food/a7f3c2',
      noindex: true,
    });
    expect(md.robots).toMatchObject({ index: false, follow: true });
  });

  it('default robots is index,follow', () => {
    const md = buildMetadata({ locale: 'en', path: '/' });
    expect(md.robots).toMatchObject({ index: true, follow: true });
  });

  it('emits OG image when provided', () => {
    const md = buildMetadata({
      locale: 'en',
      path: '/brief/logo/food',
      ogImage: 'https://thebriefyard.com/og/hub/logo/food.png',
    });
    expect(md.openGraph?.images).toBeDefined();
  });

  it('uses provided title and description', () => {
    const md = buildMetadata({
      locale: 'en',
      path: '/faq',
      title: 'FAQ — thebriefyard',
      description: 'Frequently asked questions.',
    });
    expect(md.title).toBe('FAQ — thebriefyard');
    expect(md.description).toBe('Frequently asked questions.');
  });
});
