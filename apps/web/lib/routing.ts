import type { IndustryId, JobId } from '@briefyard/types';

import type { Locale } from './i18n';

export const BASE_URL = 'https://thebriefyard.com';

function localePrefix(locale: Locale): string {
  return locale === 'en' ? '' : `/${locale}`;
}

export function canonicalUrl({ locale, path }: { locale: Locale; path: string }): string {
  const prefix = localePrefix(locale);
  if (path === '/' || path === '') {
    return prefix === '' ? BASE_URL : `${BASE_URL}${prefix}`;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${prefix}${normalized}`;
}

export function hreflangLanguages(path: string): Record<Locale, string> {
  return {
    en: canonicalUrl({ locale: 'en', path }),
    pt: canonicalUrl({ locale: 'pt', path }),
  };
}

export function hubUrl({
  locale,
  job,
  industry,
}: {
  locale: Locale;
  job: JobId;
  industry: IndustryId;
}): string {
  return canonicalUrl({ locale, path: `/brief/${job}/${industry}` });
}

export function permalinkUrl({
  locale,
  job,
  industry,
  seed,
}: {
  locale: Locale;
  job: JobId;
  industry: IndustryId;
  seed: string;
}): string {
  return canonicalUrl({ locale, path: `/brief/${job}/${industry}/${seed}` });
}
