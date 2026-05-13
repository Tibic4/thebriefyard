# STATE

## Current phase

P3 — Discoverable Web (next)

## Current week

0 (between phases — write P3 plan before starting)

## Active ADRs

ADR-001 through ADR-013.

## Active Landscape Decisions

LD-001 through LD-012.

## In progress

- Awaiting P3 plan authoring (`docs/superpowers/plans/<date>-thebriefyard-p3-web.md`).

## Blockers

- None.

## Recent decisions

- 2026-05-12: P1 (Generator core) + P2-infra closed. `generateBrief()` deterministic, 1×1 EN corpus authored, smoke-1000 green, 98.4% line coverage on `@briefyard/core`. Tag `p1-core`.
- 2026-05-12: Phase naming locked. P2 = Content library infrastructure (schemas + loader + lints + seed corpus, all shipped). Full 15×20 corpus authoring moved to P4. See README "Naming convention".
- 2026-05-12: SlotEntry.text allows empty string (sentinel for absent name-prefix/suffix). Schema change is implicit Tier 1; documented in commit `ab28c58`.
- 2026-05-12: CONTENT_VERSION bumped 1 → 2 for schema introduction (Task 1 of P1 plan).
- 2026-05-12: Vercel production deployment live at https://thebriefyard-web.vercel.app.
- 2026-05-12: P0 (Foundation) closed. Tag `p0-foundation`.
- 2026-05-12: Brand palette "Yard" locked (SPEC §16.1).
- 2026-05-12: Slot corpus license CC BY-SA 4.0.
- 2026-05-12: Working name `thebriefyard.com` (RDAP-verified available).
- 2026-05-12: Public GitHub repo at `https://github.com/Tibic4/thebriefyard`.

## Last reviewed

2026-05-12.
