import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Ad-hoc permalinks carry meta noindex; we also discourage explicit
        // crawl of seed paths to save crawl budget. Curated permalinks (P4)
        // get a separate allow rule when they land.
        disallow: ['/brief/*/*/*/'],
      },
    ],
    sitemap: 'https://thebriefyard.com/sitemap.xml',
  };
}
