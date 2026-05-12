# ADR-010 — Zod schema validates corpus in CI

- **Date:** 2026-05-12
- **Status:** accepted

## Context

The corpus is JSON in git (ADR-003). It is also user-contributed (eventually,
SEG-G). A malformed slot entry that ships to production causes runtime errors
in the generator.

## Decision

Every JSON file in `packages/content/locales/**` is validated against Zod
schemas (`packages/content/src/schema.ts`) on every PR via a vitest suite.
The build fails if any file is invalid. A `smoke-1000` test additionally
generates 1,000 random briefs and validates each against `Brief.parse`.

## Consequences

### Positive

- Corpus bugs caught at PR time, not runtime.
- Forbidden-terms list is enforced uniformly.

### Negative

- Schemas must evolve alongside the corpus. PRs that add new slot kinds must
  update schema and tests together.

### Risks accepted

- Schema is more conservative than runtime behaviour: a permissive runtime
  could accept things the schema rejects. We choose schema-strict on purpose.
