# SPEC — Architecture & Implementation Reference

> Source design (frozen at brainstorm-time):
> `docs/superpowers/specs/2026-05-12-thebriefyard-design.md`.
> When in conflict with LANDSCAPE or ROADMAP, those win.

## 1. North Star

thebriefyard is the practice engine for designers: the deepest, most discoverable,
most shareable combinatorial brief generator on the market — no AI, no paywall, no
friction.

## 2. Vocabulary (canonical)

- **Slot, Slot entry, Template** — corpus building blocks.
- **Job** (15 in v1), **Industry** (20 in v1).
- **Hub** — `/brief/[job]/[industry]`. Indexable.
- **Brief** — generated artifact with `seed`, `contentVersion`, full payload.
- **Seed** — 6-char base36 string.
- **Permalink** — `/brief/[job]/[industry]/[seed]`. Curated ⇒ indexable; ad-hoc ⇒ `noindex,follow`.
- **contentVersion** — monotonic integer; bumps on slot semantic changes.
- **Guide** — long-form authored article. v1 phase 2.
- **Locale** — `en` or `pt`. Authored per locale.
- **Expanded mode** — opt-in toggle yielding extra brief fields.

## 3. Non-goals (v1 entire — refuse if requested)

1. No LLM (LD-002).
2. No paid tier (LD-006).
3. No real-client briefing workflow.
4. No marketplace.
5. No mobile/desktop native (LD-011).
6. No multi-modal output.
7. No user accounts (LD-005).
8. No public contribution pipeline (v3+).
9. No multi-region (LD-008).
10. No invasive tracking (LD-012).

## 4. Architecture

### Layers

- **Edge / CDN** (Vercel) — SSG HTML, ISR, Edge runtime for OG.
- **Next.js app** (`apps/web`) — routes, API handlers, sitemap, robots.
- **Generator core** (`@briefyard/core`) — pure seeded TS function. SEG-A.
- **Content library** (`@briefyard/content`) — JSON corpus + Zod schema + loader. SEG-B.
- **Postgres** (Supabase) — analytics-only in v1.

### Canonical flow

1. User visits `/brief/logo/food`.
2. Page is SSG with 10 curated permalinks + interactive generator + 200–400-word blurb.
3. Click "generate new" → POST `/api/brief`.
4. Route handler invokes `generateBrief({job, industry, locale})`.
5. Response includes `seed` and `url`.
6. Client `history.replaceState` to permalink. Permalink valid forever.

### Deterministic generator contract (ADR-004)

For a fixed tuple `(job, industry, locale, seed, contentVersion, expanded)`, the
generator returns byte-identical output across any machine at any future time, while
the corresponding `compiled/content.<contentVersion>.json` exists.

### SEO surface (v1 after Phase 2)

~6,700 indexable URLs: 600 hubs, 6,000 curated permalinks, 70 guides, plus statics.
Ad-hoc permalinks carry `<meta name="robots" content="noindex,follow">`.

### Permanence & export

- OG image: Edge satori, cache 1 year.
- PDF: react-pdf, Node runtime.
- PNG: satori, Edge runtime.
- No asset storage; regenerated from seed.

## 5. Stack (locked — see ADRs)

| Layer             | Tech                              | ADR     |
| ----------------- | --------------------------------- | ------- |
| Framework         | Next.js 14 App Router + TS strict | ADR-001 |
| Styles            | Tailwind + shadcn/ui              | —       |
| DB                | Postgres 16 (Supabase)            | ADR-002 |
| Corpus            | JSON in git                       | ADR-003 |
| Generator         | Pure TS, mulberry32, base36 seeds | ADR-004 |
| Render            | react-pdf (Node) / satori (Edge)  | ADR-005 |
| Auth (v2+)        | better-auth self-hosted           | ADR-006 |
| i18n              | next-intl                         | ADR-007 |
| Licenses          | MIT code / CC BY-SA 4.0 corpus    | ADR-008 |
| DB access         | postgres-js                       | ADR-009 |
| Schema validation | Zod                               | ADR-010 |
| Quality gate      | Husky + lint-staged               | ADR-013 |

Forbidden without ADR: Redis, Kafka, MongoDB, headless Chromium, any LLM provider,
AGPL code, GA4, GTM, ORM heavier than postgres-js.

## 6. Data model

### Slot corpus (filesystem)

`packages/content/locales/{en,pt}/{slots,industries,jobs,guides,ui}.json`.
Compiled artifact: `packages/content/compiled/content.<v>.json` (gitignored).

### Postgres v1

Only `brief_log` and `brief_reaction`. Schema in design doc §9.3.

### Content versioning

`CONTENT_VERSION` monotonic int in `packages/content/version.ts`. Bumped in any PR
that changes slot semantics.

## 7. Phase plan

### Phase 1 (weeks 1–10) — "Generator + 600 hubs"

EN only. 300 (job × industry) pairs. 6,000 indexable URLs. Binary acceptance:

- `pnpm install && pnpm test` passes on fresh clone.
- `pnpm build` produces ≥ 6,000 static pages.
- Lighthouse mobile: Performance ≥ 90, SEO 100, A11y ≥ 95, Best Practices ≥ 95.
- Generator byte-identical across 100 invocations (regression script).
- 1,000 smoke briefs pass `Brief.parse`.
- Permalink + private window → same brief renders server-side.
- PDF/PNG export valid for any seed.
- OG image p95 < 500 ms.
- Sitemap lists 6,000+ URLs.
- Ad-hoc permalinks `noindex`.
- Coverage: core ≥ 95%, web routes ≥ 70%, content validation 100%.
- `main` CI green 5 consecutive commits + 14 consecutive days.

### Phase 2 (weeks 11–20) — "PT-BR + guides + permanence UX"

Add PT corpus, 30 + 40 guides, expanded mode, regenerate-slot, history, sponsor slot,
external a11y audit. Acceptance in design §10.2.

## 8. Anti-patterns

See design §14. Highlights repeated here:

- `Math.random()` in generator → use seeded PRNG.
- Slot text inside TS files → use JSON corpus.
- Machine-translating EN → PT → author per locale.
- Headless Chromium for OG → satori.
- Redis "for cache" → ADR-002 + ROADMAP §6.1.
- Logging IP → truncated UA hash.
- `any` → `unknown` + narrow.
- Hardcoding 300 hubs → `generateAll(jobs, industries)`.
- LLM-generated entries → LD-002.
- Ad-hoc seed in sitemap → `noindex`.

## 9. ADRs (index)

001 — Next.js 14 App Router + TS strict
002 — Postgres single store
003 — Slot corpus as JSON in git
004 — Pure deterministic generator
005 — PDF via react-pdf, OG via satori
006 — better-auth self-hosted (when needed)
007 — next-intl localized routes
008 — Code MIT, corpus CC BY-SA 4.0
009 — No ORM; postgres-js direct
010 — Zod validates corpus in CI
011 — Cookie & privacy policy
012 — Public API rate-limit policy
013 — Husky pre-commit gate

## 10. Quality gates

### Pre-commit (Husky)

lint-staged → prettier → typecheck + test on changed packages.

### Pre-PR (GitHub Actions)

lint, typecheck, test, build, e2e (Playwright), spec-check.
P1+ adds: content-lint, lighthouse, sitemap crawler.

### Pre-release

Full E2E + SEO crawler + manual spot-check + reconcile LANDSCAPE/ROADMAP/SPEC.

## 11. Open gaps (resolved at P0 close)

All gaps from design §16 are resolved at P0 completion:

- License confirmed (CC BY-SA).
- Brand palette locked (Yard).
- Sponsor policy: `docs/sponsor-policy.md`.
- Outreach draft: `docs/outreach-manu.md`.
- `randombrief.com` registration: queued for Phase 1 week 0.
