# thebriefyard

Practice briefs for designers. Human-curated combinatorial brief generator. No AI, no paywall.

> **Status:** P0 (foundation) under construction. Not yet usable. See `STATE.md` for
> the active phase.

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

- **P0 — Foundation** (this plan). Monorepo, governance docs, ADRs, CI.
- **P1 — Generator core.** `@briefyard/core` with TDD.
- **P2 — Content library.** `@briefyard/content` schema + pipeline + 1×1 corpus.
- **P3 — Discoverable web.** SSG, routes, SEO scaffolding, deploy preview.
- **P4 — Corpus authoring + launch.** Full 15×20 EN corpus, curated seeds, launch.

Each lives in `docs/superpowers/plans/`.
