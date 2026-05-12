# ADR-003 — Slot corpus as JSON in git, not in DB

- **Date:** 2026-05-12
- **Status:** accepted

## Context

The slot corpus is the product's moat (CAP-3). It must be:

- Reviewable in a PR (diffs matter).
- Versioned with the code that consumes it.
- Loadable at build time for SSG.
- Contribution-ready (SEG-G, v3).

## Decision

Store the corpus as JSON files in `packages/content/locales/{en,pt}/**`. A
build step compiles them into `packages/content/compiled/content.<v>.json`.
Postgres holds zero corpus data.

## Consequences

### Positive

- PR review is line-by-line.
- Schema validation runs at CI time, fails before merge.
- No DB migration to change content.
- Trivial backups (git history).

### Negative

- No live editing without a deploy.
- Localised corpora can drift; parity tests enforce structure (not text).

### Risks accepted

- Build-time loading caps total corpus size at a few MB compiled. v2 corpus
  ~10MB compiled is comfortable; if we ever approach 100MB, revisit.
