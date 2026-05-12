# ADR-009 — No ORM; postgres-js direct with Zod

- **Date:** 2026-05-12
- **Status:** accepted

## Context

v1 has two tables. v2 adds about six. The cost of an ORM (query DSL learning,
migration tooling, schema-of-schema) outweighs its value at this scale.

## Decision

Use `postgres-js` for direct SQL. Validate inputs/outputs with Zod schemas
co-located with the relevant module. Migrations are raw SQL files in
`apps/web/db/migrations/`, applied via a small script.

## Consequences

### Positive

- SQL is readable. Performance is predictable.
- Zero ORM-specific bug surface.

### Negative

- Manual joins. Acceptable at our scale.

### Risks accepted

- If complexity grows (v3+), Drizzle is the most likely upgrade — it keeps the
  SQL-first feel.
