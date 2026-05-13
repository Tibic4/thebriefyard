# thebriefyard

Practice briefs for designers. Human-curated combinatorial brief generator. No AI, no paywall.

> **Status:** P0 + P1 + P2-infra complete. P3 (Discoverable Web) next. See `STATE.md`.

**Preview:** https://thebriefyard-web.vercel.app

## Read this in order

1. `LANDSCAPE.md` — capabilities, segments, landscape decisions (LD). Highest authority.
2. `ROADMAP.md` — versions, triggers, scaling thresholds.
3. `SPEC.md` — architecture, vocabulary, data model, ADRs, phase plan.
4. `STATE.md` — current phase, ADRs active, blockers.
5. `CLAUDE.md` — short hard rules for AI coding agents.

Conflicts: LANDSCAPE > ROADMAP > SPEC.

## Develop

```sh
pnpm install
pnpm verify        # lint + typecheck + tests
pnpm --filter @briefyard/web dev
```

## Licenses

- Code: MIT (see `LICENSE`).
- Slot corpus and editorial prose: CC BY-SA 4.0 (see `LICENSE-content`).

## Sub-plans

Implementation is decomposed:

- **P0 — Foundation.** ✅ Monorepo, governance docs, ADRs, CI. Tag `p0-foundation`.
- **P1 — Generator core.** ✅ `@briefyard/core` deterministic with TDD. Tag `p1-core`.
- **P2 — Content library infrastructure.** ✅ `@briefyard/content` schemas (SlotEntry, IndustryFile, JobFile, Brief), loader, 3 content-lints (schema-valid, length-bounds, no-duplicates), `CONTENT_VERSION` discipline. Seed corpus: 1×1 EN (logo × food). Shipped alongside P1.
- **P3 — Discoverable Web.** ⏳ SSG hub routes, SEO scaffolding (canonical, hreflang, OG, JSON-LD), sitemap, robots, Lighthouse CI, 5-route audit.
- **P4 — Corpus authoring + launch.** ⏳ Author the remaining 299 (job × industry) pairs in EN, curated seeds JSON (10 per hub), launch checklist, Manu outreach send.
- **Phase 2 of v1 (separate plan).** PT-BR corpus + guides + retention UX + sponsor slot + formal a11y audit (design doc §10.2).

Each phase lives in `docs/superpowers/plans/`.

**Naming convention (locked):**

- `Pn` = implementation phase (build order). P0..P4 cover v1.
- `Phase 1 / Phase 2 of v1` = temporal windows from the design doc (weeks 1–10, 11–20).
- `v1 / v2 / v3` = product versions shipped to users. v2/v3 triggers in `ROADMAP.md`.
