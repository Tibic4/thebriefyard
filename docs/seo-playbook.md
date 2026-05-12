# SEO Playbook

Operational guide for shipping new SEO-relevant pages. Aligns with SPEC §4
(architecture) and SPEC §7 (phase plan).

## Every indexable page must have

- Unique `<title>` (50–60 chars).
- Unique `<meta name="description">` (130–155 chars).
- `<link rel="canonical">` pointing to the canonical URL.
- `hreflang` pair (`en`, `pt`) — emit both even when content for the other
  locale is not yet shipped (link to `/` for the missing one, never to a
  404).
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`.
- Twitter card: `twitter:card`, `twitter:title`, `twitter:description`,
  `twitter:image`.
- JSON-LD matching the page type (see SPEC §6).
- Five or more internal links to related pages.

## Page-type matrix

| Page              | JSON-LD types                                    | Internal links to                                                                       |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `/`               | `WebSite` + `SearchAction`                       | Top-traffic hubs, FAQ                                                                   |
| Hub               | `CollectionPage` + `BreadcrumbList` + `ItemList` | 4 same-industry hubs, 4 same-job hubs, job guide, industry guide, 10 curated permalinks |
| Curated permalink | `CreativeWork` + `BreadcrumbList`                | Parent hub, "generate another", locale alternate                                        |
| Ad-hoc permalink  | none (noindex)                                   | —                                                                                       |
| Guide             | `Article` + `BreadcrumbList` + `Author`          | Related hubs, other related guides                                                      |
| FAQ               | `FAQPage`                                        | —                                                                                       |

## Sitemap rules

- Partition at > 5,000 URLs (`/sitemap-1.xml`, `/sitemap-2.xml`, `/sitemap-index.xml`).
- Include only indexable URLs. Ad-hoc permalinks never in sitemap.
- Lastmod from content version timestamp for permalinks; from build time for
  generated pages.

## Web Vitals budgets

- LCP ≤ 1.5 s on simulated 4G.
- CLS ≤ 0.05.
- INP ≤ 200 ms.
- Total client JS on indexable pages ≤ 60 KB gzipped.
- Self-host fonts via `next/font` (not Google Fonts CDN cascade).

## OG image template

- 1200 × 630 (social standard).
- Background `yard-cream` `#FAF6EF`.
- Brand mark `yard-primary` `#C2410C`.
- Typography `yard-ink` `#1A1A1A`.
- Cached forever at the seed level.
