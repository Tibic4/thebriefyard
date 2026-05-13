import { readCorpus } from '@briefyard/content';
import { INDUSTRY_IDS, JOB_IDS } from '@briefyard/types';
import type { MetadataRoute } from 'next';

import { locales, type Locale } from '../lib/i18n';
import { canonicalUrl, hubUrl } from '../lib/routing';

function safeReadCorpus(locale: Locale) {
  try {
    return readCorpus(locale);
  } catch {
    return null;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const lastModified = new Date();

  // Statics for both locales.
  for (const locale of locales) {
    for (const path of ['/', '/about', '/faq', '/newsletter']) {
      entries.push({
        url: canonicalUrl({ locale, path }),
        lastModified,
        changeFrequency: 'monthly',
        priority: path === '/' ? 1.0 : 0.6,
      });
    }
  }

  // Hubs — only for (job, industry) pairs that exist in the EN corpus. PT hubs
  // ship as routing placeholders (Phase 2 of v1 fills the content); they are
  // still indexable, so they go in the sitemap.
  for (const locale of locales) {
    const corpus = safeReadCorpus(locale);
    // For PT (no corpus yet), enumerate the EN corpus's pairs as the canonical set.
    const referenceCorpus = corpus ?? safeReadCorpus('en');
    if (!referenceCorpus) continue;
    for (const job of JOB_IDS) {
      if (!referenceCorpus.jobs[job]) continue;
      for (const industry of INDUSTRY_IDS) {
        if (!referenceCorpus.industries[industry]) continue;
        entries.push({
          url: hubUrl({ locale, job, industry }),
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
