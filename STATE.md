# STATE

## Current phase

P4 — Corpus authoring + launch (next)

## Current week

0 (between phases — write P4 plan before starting)

## Active ADRs

ADR-001 through ADR-014.

## Active Landscape Decisions

LD-001 through LD-012.

## In progress

- Awaiting P4 plan authoring (`docs/superpowers/plans/<date>-thebriefyard-p4-launch.md`).

## Blockers

- None.

## Recent decisions

- 2026-05-12: P3 (Discoverable Web) closed. Tag `p3-web`. Routes shipped: home/about/faq/newsletter (EN+PT, all SSG), `/brief/logo/food` (hub SSG), `/brief/logo/food/[seed]` (ad-hoc permalink ISR with noindex), `POST /api/brief`, `GET /api/og/[seed]` Edge satori, `POST /api/export` stub (501), dynamic `/sitemap.xml`, dynamic `/robots.txt`. SEO scaffolding (canonical + hreflang + OG + Twitter + JSON-LD per page type). Lighthouse CI gate active on 5 reference routes per ADR-014.
- 2026-05-12: ADR-014 (Lighthouse CI thresholds) accepted: Performance ≥ 0.90, SEO 1.00, Accessibility ≥ 0.95, Best Practices ≥ 0.95.
- 2026-05-12: OG image runtime is Edge with parameters-via-query (caller pre-generates fragments). The Edge-without-corpus approach avoids the `node:fs` constraint; the corpus-loading variant was attempted and rolled back due to a Next 14 + `next/og` Windows-runtime font-resolution bug.
- 2026-05-12: P1 (Generator core) + P2-infra closed. Tag `p1-core`. 27/27 core tests verde, 98.4% line coverage. 135 content lints verde.
- 2026-05-12: Phase naming locked. P2 = Content library infrastructure (schemas + loader + lints + seed corpus, all shipped). Full 15×20 corpus authoring moved to P4.
- 2026-05-12: SlotEntry.text allows empty string (sentinel for absent name-prefix/suffix).
- 2026-05-12: CONTENT_VERSION bumped 1 → 2 for schema introduction (Task 1 of P1 plan).
- 2026-05-12: Vercel production deployment live at https://thebriefyard-web.vercel.app.
- 2026-05-12: P0 (Foundation) closed. Tag `p0-foundation`.
- 2026-05-12: Brand palette "Yard" locked (SPEC §16.1).
- 2026-05-12: Slot corpus license CC BY-SA 4.0.
- 2026-05-12: Working name `thebriefyard.com` (RDAP-verified available).
- 2026-05-12: Public GitHub repo at `https://github.com/Tibic4/thebriefyard`.

## Last reviewed

2026-05-12.
