# thebriefyard P3 — Discoverable Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use `- [ ]` checkboxes. **TDD discipline applies to every route handler and lib module.** Write the failing test/e2e first, observe it fail, implement, observe pass, commit.

**Goal:** Make `@briefyard/web` _discoverable_. Ship the SSG hub route, ad-hoc permalink route, the `POST /api/brief` and `GET /api/og/[seed]` route handlers, complete SEO scaffolding (canonical, hreflang, OG, twitter, JSON-LD), sitemap.xml, robots.txt, EN+PT routing via next-intl, and a Lighthouse CI gate on five reference routes. This is the **traffic engine** (CAP-2) and the primary v1 differentiator vs Goodbrief.io's ~4 indexable URLs.

**Architecture:** `apps/web` is the only target package. P3 grows the route tree from the P0 stub (`/`) to the full discoverable surface for the **1 corpus pair authored so far** (`logo × food`). The SSG static-params functions read from `@briefyard/content`'s `readCorpus()` — meaning the site automatically expands when P4 authors more pairs. No corpus authoring in P3.

**Tech stack additions (each requires the matching ADR amendment OR is a no-new-dep refactor):**

| Item                    | Status          | ADR action                                           |
| ----------------------- | --------------- | ---------------------------------------------------- |
| `next-intl`             | New dep         | ADR-007 already accepted — install only              |
| `@vercel/og` + `satori` | New runtime dep | ADR-005 already accepted — install only              |
| `@lhci/cli`             | New CI dep      | New ADR (ADR-014) for Lighthouse CI threshold policy |

**Prerequisites:**

- P2-infra complete (loader resolves the `logo × food` pair, `Brief` schema exported). ✅
- P1 generator green (`generateBrief()` available, smoke-1000 passing). ✅
- CI green on `main`. ✅
- Vercel preview wired. ✅

**Out of scope of P3:**

- Authoring the remaining 299 corpus pairs (→ P4).
- Curated-seeds JSON / indexable permalinks (→ P4).
- PDF/PNG export beyond a stub that returns `501 Not Implemented` (→ later plan; ADR-005 still applies).
- PT-BR slot corpus content (→ Phase 2 of v1). P3 wires the **routing** for PT, but the PT side serves an "Em breve" placeholder until corpus is authored.
- Plausible + Vercel Web Analytics live wiring (→ end of P4 / launch checklist).

---

## Naming reminder (locked in README)

- "Pn" = implementation phase. This is P3.
- "Phase 1/2 of v1" = temporal windows from the design doc.
- "v1/v2/v3" = product versions.

---

## File map

```
apps/web/
├── app/
│   ├── [locale]/                                         # next-intl localized segment
│   │   ├── layout.tsx                                    # root layout with html lang + hreflang
│   │   ├── page.tsx                                      # home (existed; refactored)
│   │   ├── about/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── newsletter/page.tsx
│   │   └── brief/
│   │       ├── [job]/
│   │       │   └── [industry]/
│   │       │       ├── page.tsx                          # hub SSG (200 → 600 URLs at P4)
│   │       │       └── [seed]/
│   │       │           └── page.tsx                      # ad-hoc permalink (ISR, noindex)
│   ├── api/
│   │   ├── brief/route.ts                                # POST → {seed, brief, url}
│   │   ├── og/[seed]/route.tsx                           # Edge runtime, satori
│   │   └── export/route.ts                               # stub 501
│   ├── sitemap.ts                                        # Next dynamic sitemap
│   ├── robots.ts                                         # Next dynamic robots
│   └── middleware.ts                                     # next-intl locale negotiation
├── components/
│   ├── BriefCard.tsx                                     # renders a Brief object
│   ├── GenerateButton.tsx                                # client component, POST /api/brief
│   ├── HreflangAlternates.tsx                            # emits <link rel="alternate">
│   └── JsonLd.tsx                                        # typed JSON-LD injector
├── lib/
│   ├── seo.ts                                            # buildMetadata({locale, path, ...})
│   ├── jsonld.ts                                         # buildWebSite, buildCollectionPage, buildCreativeWork, ...
│   ├── routing.ts                                        # canonical URL helpers
│   └── i18n.ts                                           # next-intl config
├── messages/                                             # next-intl message bundles
│   ├── en.json                                           # imports/transforms from packages/content/locales/en/ui.json
│   └── pt.json                                           # placeholder until Phase 2 of v1
├── e2e/
│   ├── home.spec.ts                                      # existing smoke + hreflang + canonical
│   ├── hub.spec.ts                                       # /brief/logo/food SSG renders, JSON-LD valid
│   ├── permalink.spec.ts                                 # /brief/logo/food/<seed> renders, noindex
│   ├── api-brief.spec.ts                                 # POST /api/brief integration
│   ├── api-og.spec.ts                                    # GET /api/og/<seed> PNG signature
│   ├── sitemap.spec.ts                                   # /sitemap.xml lists expected URLs
│   └── robots.spec.ts                                    # /robots.txt format
├── lighthouserc.json                                     # 5-route Lighthouse CI config
└── (existing files modified: tsconfig, next.config, package.json, playwright.config)

.github/workflows/ci.yml                                  # add lighthouse job

docs/adrs/
└── ADR-014-lighthouse-ci-threshold.md                    # new ADR

packages/content/
└── locales/en/ui.json                                    # extended with hub-blurb keys
```

---

## Task index

| #   | Task                                                            | TDD focus   |
| --- | --------------------------------------------------------------- | ----------- |
| 1   | Install deps (`next-intl`, `@vercel/og`, `@lhci/cli`) + ADR-014 | n/a         |
| 2   | next-intl scaffolding (middleware, i18n.ts, messages/)          | unit        |
| 3   | Refactor existing `/` into `[locale]/` segment                  | e2e smoke   |
| 4   | `lib/seo.ts` — `buildMetadata` helper                           | unit        |
| 5   | `lib/jsonld.ts` — JSON-LD builders                              | unit        |
| 6   | `lib/routing.ts` — canonical URL helpers                        | unit        |
| 7   | Hub route `/brief/[job]/[industry]` SSG                         | e2e         |
| 8   | Ad-hoc permalink `/brief/[job]/[industry]/[seed]` ISR           | e2e         |
| 9   | `POST /api/brief` route handler                                 | integration |
| 10  | `GET /api/og/[seed]` Edge satori                                | e2e         |
| 11  | `POST /api/export` stub (501)                                   | integration |
| 12  | `sitemap.xml` dynamic                                           | e2e         |
| 13  | `robots.txt` dynamic                                            | e2e         |
| 14  | About / FAQ / Newsletter static pages                           | e2e         |
| 15  | Lighthouse CI on 5 reference routes                             | CI          |
| 16  | Close-out: update STATE.md, tag `p3-web`, push                  | n/a         |

Each task is small enough to commit independently. Average 1 commit per task, plus follow-up commits for any lint/typecheck fixes.

---

## Task 1 — Dependencies + ADR-014

**Files:**

- Modify: `apps/web/package.json` (add `next-intl`, `@vercel/og`)
- Modify: root `package.json` (add `@lhci/cli` as devDep)
- Create: `docs/adrs/ADR-014-lighthouse-ci-threshold.md`

- [ ] **Step 1: Install runtime deps in `@briefyard/web`**

```
pnpm --filter @briefyard/web add next-intl@^3.21.0 @vercel/og@^0.6.3
```

- [ ] **Step 2: Install Lighthouse CI as root devDep**

```
pnpm add -Dw @lhci/cli@^0.14.0
```

- [ ] **Step 3: Author ADR-014**

`docs/adrs/ADR-014-lighthouse-ci-threshold.md`:

```markdown
# ADR-014 — Lighthouse CI thresholds

- **Date:** 2026-MM-DD
- **Status:** accepted

## Context

P3 ships the traffic-engine routes (CAP-2). To detect regressions in Web Vitals
or SEO completeness, we need an automated gate in CI. Lighthouse CI is the
standard.

## Decision

Run `@lhci/cli` on a 5-route reference set on every PR. Routes:

1. `/` (home, EN)
2. `/pt` (home, PT)
3. `/brief/logo/food` (hub, EN)
4. `/brief/logo/food/<deterministic seed>` (ad-hoc permalink, EN)
5. `/faq` (static)

Thresholds (mobile, throttled 4G):

- Performance ≥ 90
- SEO 100
- Accessibility ≥ 95
- Best Practices ≥ 95

A score below threshold fails CI.

## Consequences

### Positive

- Web Vitals regressions caught at PR time.
- SEO completeness (canonical, hreflang, JSON-LD) verified continuously.

### Negative

- Lighthouse runs add ~3 min to PR CI. Acceptable trade-off vs production
  regression detection.

### Risks accepted

- Lighthouse is non-deterministic; budget some flakiness with 2 reruns and
  median scoring.
```

- [ ] **Step 4: Sync lockfile + commit**

(Lockfile must be in the same commit — see memory rule.)

```
git add apps/web/package.json package.json pnpm-lock.yaml docs/adrs/ADR-014-lighthouse-ci-threshold.md
git commit -m "feat(web): install next-intl, @vercel/og, @lhci/cli; add ADR-014 (Lighthouse thresholds)"
```

---

## Task 2 — next-intl scaffolding

**Files:**

- Create: `apps/web/lib/i18n.ts`
- Create: `apps/web/messages/en.json`
- Create: `apps/web/messages/pt.json`
- Create: `apps/web/app/middleware.ts` (or `apps/web/middleware.ts`)
- Modify: `apps/web/next.config.mjs` (add `next-intl/plugin`)

- [ ] **Step 1: Write `lib/i18n.ts`**

```ts
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'pt'] as const;
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();
  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 2: Seed `messages/en.json` from `packages/content/locales/en/ui.json`**

The content package owns the translatable UI strings; `apps/web/messages/en.json`
is a build-time mirror. For now, copy by hand (or write a `scripts/sync-messages.ts`
that's idempotent — recommended). Required keys for P3:

```json
{
  "site": {
    "title": "thebriefyard",
    "tagline": "Practice briefs for designers. No AI, no paywall."
  },
  "cta": {
    "generate": "Generate brief",
    "another": "Generate another",
    "permalink": "Copy permalink"
  },
  "footer": { "credit": "Open source on GitHub. Slot corpus CC BY-SA 4.0." },
  "hub": { "examplesHeading": "Examples", "generatorHeading": "Try it" },
  "permalink": {
    "noindexNote": "This is an ad-hoc brief. The seed in the URL makes it shareable."
  },
  "faq": { "title": "FAQ" }
}
```

- [ ] **Step 3: Stub `messages/pt.json`**

Same keys, PT-BR text authored by hand. Only the keys actually rendered in P3
routes need translation now.

- [ ] **Step 4: Middleware for locale negotiation**

`apps/web/middleware.ts`:

```ts
import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from './lib/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // EN at `/`, PT at `/pt`
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

- [ ] **Step 5: Wire `next-intl/plugin` in `next.config.mjs`**

```js
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@briefyard/core', '@briefyard/content', '@briefyard/types'],
  experimental: { typedRoutes: true },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 6: Unit test for `lib/i18n.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { locales, defaultLocale } from '../lib/i18n';

describe('i18n config', () => {
  it('exports locales = [en, pt]', () => {
    expect(locales).toEqual(['en', 'pt']);
  });
  it('defaults to en', () => {
    expect(defaultLocale).toBe('en');
  });
});
```

(Web package currently has no vitest config. This task includes adding one — minimal config that mirrors `packages/core` setup.)

- [ ] **Step 7: Commit**

```
git add apps/web pnpm-lock.yaml
git commit -m "feat(web): next-intl scaffolding (locales, middleware, messages, plugin)"
```

---

## Task 3 — Move `/` into `[locale]/` segment

**Files:**

- Move: `apps/web/app/layout.tsx` → `apps/web/app/[locale]/layout.tsx`
- Move: `apps/web/app/page.tsx` → `apps/web/app/[locale]/page.tsx`
- Create: `apps/web/app/layout.tsx` (root-level, passthrough)
- Modify: existing e2e smoke spec

- [ ] **Step 1: Refactor layouts**

Root `layout.tsx` becomes minimal (just `<html>`-less `{children}` passthrough; html tag lives in `[locale]/layout.tsx` because the `lang` attribute depends on locale).

`[locale]/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { locales, type Locale } from '../../lib/i18n';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  // delegate to lib/seo.ts when Task 4 lands
  return { title: 'thebriefyard', description: '...' };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  if (!locales.includes(params.locale)) notFound();
  const messages = await getMessages();
  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update Playwright smoke to hit `/` (which is EN) and `/pt`**

```ts
test('home renders the foundation scaffold (EN)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'thebriefyard' })).toBeVisible();
});

test('PT route renders with lang=pt', async ({ page }) => {
  await page.goto('/pt');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
});
```

- [ ] **Step 3: Build + e2e**

```
pnpm --filter @briefyard/web build
pnpm --filter @briefyard/web test:e2e
```

- [ ] **Step 4: Commit**

```
git commit -m "feat(web): move routes into [locale]/ segment; EN at /, PT at /pt"
```

---

## Task 4 — `lib/seo.ts` `buildMetadata` helper

TDD: tests first, helper second.

**Files:**

- Create: `apps/web/lib/seo.ts`
- Create: `apps/web/__tests__/seo.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, expect, it } from 'vitest';
import { buildMetadata } from '../lib/seo';

describe('buildMetadata', () => {
  it('emits canonical for EN home', () => {
    const md = buildMetadata({ locale: 'en', path: '/' });
    expect(md.alternates?.canonical).toBe('https://thebriefyard.com/');
  });

  it('emits hreflang pair for both locales', () => {
    const md = buildMetadata({ locale: 'en', path: '/' });
    expect(md.alternates?.languages?.['en']).toBe('https://thebriefyard.com/');
    expect(md.alternates?.languages?.['pt']).toBe('https://thebriefyard.com/pt');
  });

  it('emits OG image url', () => {
    const md = buildMetadata({
      locale: 'en',
      path: '/brief/logo/food',
      ogImage: '/og/brief/logo/food.png',
    });
    expect(md.openGraph?.images).toBeDefined();
  });

  it('respects noindex flag', () => {
    const md = buildMetadata({ locale: 'en', path: '/brief/logo/food/a7f3c2', noindex: true });
    expect(md.robots).toMatchObject({ index: false, follow: true });
  });
});
```

- [ ] **Step 2: Implement (signature)**

```ts
import type { Metadata } from 'next';
import type { Locale } from './i18n';

interface BuildMetadataInput {
  locale: Locale;
  path: string; // "/" or "/brief/logo/food" etc.
  title?: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
}

const BASE_URL = 'https://thebriefyard.com';

export function buildMetadata(input: BuildMetadataInput): Metadata {
  // ...
}
```

- [ ] **Step 3: GREEN + commit**

---

## Task 5 — `lib/jsonld.ts` JSON-LD builders

TDD per builder. Functions: `buildWebSite`, `buildCollectionPage`, `buildBreadcrumbList`, `buildItemList`, `buildCreativeWork`, `buildFaqPage`. Each returns a typed JSON-LD object validated against the relevant schema.org type.

Tests verify required fields and `@context`/`@type` presence. Implementation is straightforward objects.

Commit: `feat(web): add JSON-LD builders (WebSite, CollectionPage, BreadcrumbList, CreativeWork, FAQPage)`.

---

## Task 6 — `lib/routing.ts` canonical URL helpers

TDD. Functions:

- `canonicalUrl({ locale, path })` → string
- `hreflangLanguages(path)` → `Record<Locale, string>`
- `permalinkUrl({ locale, job, industry, seed })` → string

Commit: `feat(web): add canonical URL + hreflang helpers`.

---

## Task 7 — Hub route `/brief/[job]/[industry]`

**Files:**

- Create: `apps/web/app/[locale]/brief/[job]/[industry]/page.tsx`
- Create: `apps/web/components/BriefCard.tsx`
- Create: `apps/web/components/GenerateButton.tsx` (client component stub)
- Create: `apps/web/e2e/hub.spec.ts`

- [ ] **Step 1: e2e first (RED)**

```ts
import { expect, test } from '@playwright/test';

test('hub /brief/logo/food renders SSG with canonical + hreflang + JSON-LD', async ({ page }) => {
  await page.goto('/brief/logo/food');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://thebriefyard.com/brief/logo/food',
  );
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
  await expect(page.locator('link[hreflang="pt"]')).toHaveCount(1);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2); // CollectionPage + BreadcrumbList
  // Body has the blurb text
  await expect(page.getByText(/Designing for food brands/)).toBeVisible();
});

test('hub for an unauthored pair returns 404', async ({ page }) => {
  const res = await page.goto('/brief/logo/tech');
  expect(res?.status()).toBe(404);
});
```

- [ ] **Step 2: Implement page.tsx**

- `generateStaticParams` reads `readCorpus('en')` and emits one param per pair where both `industry` and `job` exist. For now: 1 entry.
- Component composition: blurb → 10-example placeholder list (empty in P3, P4 fills it) → `GenerateButton` → footer with sibling-hub links (4 same-job + 4 same-industry — also empty for P3 since only 1 pair exists).
- JSON-LD: `CollectionPage` + `BreadcrumbList`.
- Metadata via `buildMetadata`, including `ogImage: /api/og/hub/logo/food.png` (Task 10).

- [ ] **Step 3: GREEN + commit**

---

## Task 8 — Ad-hoc permalink `/brief/[job]/[industry]/[seed]` (ISR)

**Files:**

- Create: `apps/web/app/[locale]/brief/[job]/[industry]/[seed]/page.tsx`
- Create: `apps/web/e2e/permalink.spec.ts`

- [ ] **Step 1: e2e first**

```ts
test('permalink renders deterministic brief with noindex,follow', async ({ page }) => {
  await page.goto('/brief/logo/food/regd001');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('same seed renders byte-identical brief on two requests', async ({ page, context }) => {
  await page.goto('/brief/logo/food/regd001');
  const h1a = await page.getByRole('heading', { level: 1 }).textContent();
  const page2 = await context.newPage();
  await page2.goto('/brief/logo/food/regd001');
  const h1b = await page2.getByRole('heading', { level: 1 }).textContent();
  expect(h1a).toBe(h1b);
});
```

- [ ] **Step 2: Implement**

Page is `force-dynamic: false` + ISR via `export const revalidate = 60 * 60 * 24 * 365` (1 year — seed is immutable for fixed contentVersion).

Body: calls `generateBrief({ job, industry, locale, seed })` server-side. No `generateStaticParams` — every seed is on-demand ISR. Metadata: noindex via `buildMetadata({ noindex: true })`.

- [ ] **Step 3: GREEN + commit**

---

## Task 9 — `POST /api/brief`

**Files:**

- Create: `apps/web/app/api/brief/route.ts`
- Create: `apps/web/e2e/api-brief.spec.ts`

- [ ] **Step 1: Integration test first**

```ts
test('POST /api/brief returns seed, brief, url', async ({ request }) => {
  const res = await request.post('/api/brief', {
    data: { job: 'logo', industry: 'food', locale: 'en' },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.seed).toMatch(/^[0-9a-z]{6}$/);
  expect(body.url).toBe(`/brief/logo/food/${body.seed}`);
  expect(body.brief.job).toBe('logo');
});

test('POST /api/brief 400 on missing User-Agent', async ({ request }) => {
  const res = await request.post('/api/brief', {
    headers: { 'User-Agent': '' },
    data: { job: 'logo', industry: 'food', locale: 'en' },
  });
  expect(res.status()).toBe(400);
});

test('POST /api/brief 400 on invalid job', async ({ request }) => {
  const res = await request.post('/api/brief', {
    data: { job: 'invented-job', industry: 'food', locale: 'en' },
  });
  expect(res.status()).toBe(400);
});
```

- [ ] **Step 2: Implement**

- Validate body with Zod (JobId/IndustryId/LocaleId from `@briefyard/types`).
- Reject empty/missing User-Agent per ADR-012 (rate-limit policy).
- Call `generateBrief()`.
- Return `{ seed, brief, url }`.

- [ ] **Step 3: GREEN + commit**

---

## Task 10 — `GET /api/og/[seed]` Edge satori

**Files:**

- Create: `apps/web/app/api/og/[seed]/route.tsx`
- Create: `apps/web/e2e/api-og.spec.ts`

- [ ] **Step 1: e2e first**

```ts
test('GET /api/og/<seed>?j=logo&i=food&l=en returns a PNG', async ({ request }) => {
  const res = await request.get('/api/og/a7f3c2?j=logo&i=food&l=en');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toBe('image/png');
  const buf = await res.body();
  // PNG signature
  expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
});
```

- [ ] **Step 2: Implement with `@vercel/og` + Yard palette**

- Edge runtime.
- 1200×630.
- Background `#FAF6EF` (yard-cream), brand mark `#C2410C` (yard-primary), typography `#1A1A1A` (yard-ink). Per `docs/seo-playbook.md`.
- Cache 1 year (`Cache-Control: public, max-age=31536000, immutable`).
- Body shows: `Brief.company.name` + first 80 chars of `Brief.company.description`.

- [ ] **Step 3: GREEN + commit**

---

## Task 11 — `POST /api/export` stub (501)

Lightweight. Returns 501 with `{ error: 'Not implemented', plan: 'P3.5' }`. Integration test asserts 501. Commit message: `feat(web): stub /api/export returning 501 (full implementation in a later plan)`.

---

## Task 12 — `app/sitemap.ts`

**Files:**

- Create: `apps/web/app/sitemap.ts`
- Create: `apps/web/e2e/sitemap.spec.ts`

- [ ] **Step 1: e2e first**

```ts
test('GET /sitemap.xml lists EN+PT home, faq, about, and one hub per locale per existing pair', async ({
  request,
}) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toMatch(/xml/);
  const xml = await res.text();
  expect(xml).toContain('https://thebriefyard.com/');
  expect(xml).toContain('https://thebriefyard.com/pt');
  expect(xml).toContain('https://thebriefyard.com/brief/logo/food');
  expect(xml).toContain('https://thebriefyard.com/pt/brief/logo/food');
  expect(xml).toContain('https://thebriefyard.com/faq');
  // Ad-hoc permalinks never in sitemap
  expect(xml).not.toContain('/brief/logo/food/');
});
```

- [ ] **Step 2: Implement**

Next 14 dynamic sitemap returns `MetadataRoute.Sitemap` array. Loop over `readCorpus().industries` × `readCorpus().jobs` to emit hub URLs (currently 2 → 2 locales × 1 pair). Plus statics.

- [ ] **Step 3: GREEN + commit**

---

## Task 13 — `app/robots.ts`

Replaces the P0 placeholder `public/robots.txt`. Allows everything, points to sitemap, disallows ad-hoc permalink paths from being explicitly fetched by crawlers (defense-in-depth — `noindex` meta is the primary signal).

Commit: `feat(web): dynamic /robots.txt with sitemap pointer`.

---

## Task 14 — About / FAQ / Newsletter static pages

Minimal authored prose. About: ~300 words including the Goodbrief credit (per Manu outreach draft). FAQ: 8-10 Q&A pairs with `FAQPage` JSON-LD. Newsletter: Buttondown embed placeholder.

Commit: `feat(web): about, faq, newsletter static pages with FAQPage JSON-LD`.

---

## Task 15 — Lighthouse CI

**Files:**

- Create: `apps/web/lighthouserc.json`
- Modify: `.github/workflows/ci.yml` (add `lighthouse` job)

- [ ] **Step 1: `lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://127.0.0.1:3100/",
        "http://127.0.0.1:3100/pt",
        "http://127.0.0.1:3100/brief/logo/food",
        "http://127.0.0.1:3100/brief/logo/food/regd001",
        "http://127.0.0.1:3100/faq"
      ],
      "startServerCommand": "pnpm --filter @briefyard/web exec next start -p 3100",
      "startServerReadyPattern": "ready started server",
      "numberOfRuns": 2
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 1.0 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

- [ ] **Step 2: Add `lighthouse` job to ci.yml**

```yaml
lighthouse:
  runs-on: ubuntu-latest
  needs: verify
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
      with: { version: 9.12.0 }
    - uses: actions/setup-node@v4
      with: { node-version-file: '.nvmrc', cache: 'pnpm' }
    - run: pnpm install --frozen-lockfile
    - run: pnpm --filter @briefyard/web exec playwright install --with-deps chromium
    - run: pnpm --filter @briefyard/web build
    - run: pnpm exec lhci autorun --config=apps/web/lighthouserc.json
```

- [ ] **Step 3: Commit + push; verify CI Lighthouse job lands green**

---

## Task 16 — Close-out

- [ ] **Step 1: `pnpm verify` clean locally**
- [ ] **Step 2: `pnpm --filter @briefyard/web build && pnpm --filter @briefyard/web test:e2e` clean**
- [ ] **Step 3: Visual smoke** — open Vercel preview, click "Generate brief" on home, confirm permalink updates and URL is shareable.
- [ ] **Step 4: Update `STATE.md`**

```markdown
## Current phase

P4 — Corpus authoring + launch (next)

## Recent decisions

- 2026-MM-DD: P3 (Discoverable Web) closed. Tag `p3-web`. Routes shipped: home/about/faq/newsletter (EN+PT), /brief/logo/food (hub), /brief/logo/food/[seed] (ISR ad-hoc), POST /api/brief, GET /api/og/[seed] satori, /sitemap.xml, /robots.txt. Lighthouse CI gate active (Perf≥90, SEO 100, A11y≥95, BP≥95) on 5 reference routes.
```

- [ ] **Step 5: Tag**

```
git tag -a p3-web -m "P3 — Discoverable Web complete"
git push origin p3-web
```

---

## Known followups (not blocking P3 close)

- PT-BR slot corpus + EN/PT parity test (→ Phase 2 of v1).
- Curated-seeds JSON + indexable permalinks (→ P4).
- Full PDF/PNG export implementation (→ separate plan, ADR-005 still applies).
- 4-related-hubs internal-linking algorithm needs > 1 pair authored; placeholder UI in P3 (→ P4).
- Plausible + Vercel Web Analytics live wiring (→ launch checklist in P4).
- Sponsor slot UI (→ Phase 2 of v1; sponsor-policy.md already exists).

---

**End of plan.** Approval gate: user reviews this file, requests changes if needed, then `superpowers:executing-plans` (or direct execution per autonomy preference) starts Task 1.
