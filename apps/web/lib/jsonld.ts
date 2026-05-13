import type { Locale } from './i18n';
import { BASE_URL, canonicalUrl } from './routing';

const CONTEXT = 'https://schema.org' as const;

export interface WebSiteLd {
  '@context': typeof CONTEXT;
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export function buildWebSite({ locale }: { locale: Locale }): WebSiteLd {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    name: 'thebriefyard',
    url: canonicalUrl({ locale, path: '/' }),
  };
}

export interface CollectionPageLd {
  '@context': typeof CONTEXT;
  '@type': 'CollectionPage';
  name: string;
  description: string;
  url: string;
  inLanguage: Locale;
}

export function buildCollectionPage({
  locale,
  path,
  name,
  description,
}: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
}): CollectionPageLd {
  return {
    '@context': CONTEXT,
    '@type': 'CollectionPage',
    name,
    description,
    url: canonicalUrl({ locale, path }),
    inLanguage: locale,
  };
}

export interface BreadcrumbListLd {
  '@context': typeof CONTEXT;
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export function buildBreadcrumbList(items: Array<{ name: string; url: string }>): BreadcrumbListLd {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export interface CreativeWorkLd {
  '@context': typeof CONTEXT;
  '@type': 'CreativeWork';
  headline: string;
  description: string;
  url: string;
  creator: { '@type': 'Organization'; name: string; url: string };
}

export function buildCreativeWork({
  url,
  headline,
  description,
}: {
  url: string;
  headline: string;
  description: string;
}): CreativeWorkLd {
  return {
    '@context': CONTEXT,
    '@type': 'CreativeWork',
    headline,
    description,
    url,
    creator: { '@type': 'Organization', name: 'thebriefyard', url: BASE_URL },
  };
}

export interface FaqPageLd {
  '@context': typeof CONTEXT;
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }>;
}

export function buildFaqPage(items: Array<{ question: string; answer: string }>): FaqPageLd {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  };
}
