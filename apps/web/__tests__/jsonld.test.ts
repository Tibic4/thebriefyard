import { describe, expect, it } from 'vitest';

import {
  buildBreadcrumbList,
  buildCollectionPage,
  buildCreativeWork,
  buildFaqPage,
  buildWebSite,
} from '../lib/jsonld.js';

describe('jsonld builders', () => {
  it('buildWebSite has @context and @type', () => {
    const ld = buildWebSite({ locale: 'en' });
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('WebSite');
    expect(ld.url).toBe('https://thebriefyard.com');
  });

  it('buildWebSite emits PT url for pt locale', () => {
    const ld = buildWebSite({ locale: 'pt' });
    expect(ld.url).toBe('https://thebriefyard.com/pt');
  });

  it('buildCollectionPage includes name and url', () => {
    const ld = buildCollectionPage({
      locale: 'en',
      path: '/brief/logo/food',
      name: 'Logo briefs for food brands',
      description: 'Practice realistic logo briefs.',
    });
    expect(ld['@type']).toBe('CollectionPage');
    expect(ld.name).toBe('Logo briefs for food brands');
    expect(ld.url).toBe('https://thebriefyard.com/brief/logo/food');
  });

  it('buildBreadcrumbList emits item list with positions', () => {
    const ld = buildBreadcrumbList([
      { name: 'Home', url: 'https://thebriefyard.com' },
      { name: 'Logo × Food', url: 'https://thebriefyard.com/brief/logo/food' },
    ]);
    expect(ld['@type']).toBe('BreadcrumbList');
    expect(ld.itemListElement).toHaveLength(2);
    expect(ld.itemListElement[0]?.position).toBe(1);
    expect(ld.itemListElement[1]?.position).toBe(2);
  });

  it('buildCreativeWork has author and dateCreated', () => {
    const ld = buildCreativeWork({
      url: 'https://thebriefyard.com/brief/logo/food/a7f3c2',
      headline: 'Logo brief for Mossfield',
      description: 'Practice brief.',
    });
    expect(ld['@type']).toBe('CreativeWork');
    expect(ld.url).toBe('https://thebriefyard.com/brief/logo/food/a7f3c2');
  });

  it('buildFaqPage emits mainEntity with Q/A pairs', () => {
    const ld = buildFaqPage([
      { question: 'Is it free?', answer: 'Yes.' },
      { question: 'Any AI?', answer: 'No.' },
    ]);
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity).toHaveLength(2);
    expect(ld.mainEntity[0]?.['@type']).toBe('Question');
    expect(ld.mainEntity[0]?.acceptedAnswer['@type']).toBe('Answer');
  });
});
