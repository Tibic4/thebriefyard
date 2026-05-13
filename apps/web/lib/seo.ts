import type { Metadata } from 'next';

import type { Locale } from './i18n';
import { canonicalUrl, hreflangLanguages } from './routing';

export interface BuildMetadataInput {
  locale: Locale;
  path: string;
  title?: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = 'thebriefyard — Practice briefs for designers';
const DEFAULT_DESCRIPTION =
  'Human-curated combinatorial design briefs. Practice your portfolio with reproducible, shareable briefs. No AI, no paywall.';

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const { locale, path, title, description, ogImage, noindex } = input;
  const url = canonicalUrl({ locale, path });
  const langs = hreflangLanguages(path);
  const finalTitle = title ?? DEFAULT_TITLE;
  const finalDescription = description ?? DEFAULT_DESCRIPTION;

  return {
    metadataBase: new URL('https://thebriefyard.com'),
    title: finalTitle,
    description: finalDescription,
    alternates: {
      canonical: url,
      languages: langs,
    },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      title: finalTitle,
      description: finalDescription,
      locale,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
