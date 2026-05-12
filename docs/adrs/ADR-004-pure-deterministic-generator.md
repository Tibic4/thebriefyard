# ADR-004 — Pure deterministic generator (mulberry32, base36 seeds)

- **Date:** 2026-05-12
- **Status:** accepted

## Context

Permalinks (`/brief/[job]/[industry]/[seed]`) require that the same input always
yields the same output, for the lifetime of the corresponding `contentVersion`.
This is non-negotiable for SEO (Google must always see the same brief) and for
sharing.

## Decision

`generateBrief()` is a pure function with no IO and no `Date.now()` or
`Math.random()` calls in its dependency tree. Randomness comes from a seeded
PRNG — **mulberry32** — initialised from the seed string. Seeds are 6-char
base36 (`[0-9a-z]{6}`, ~2.18B combinations).

## Consequences

### Positive

- Byte-identical output across builds, regions, future deploys.
- Trivially testable (1,000 iterations of `expect(generateBrief(x)).toEqual(...)`).
- SSG can pre-render permalinks ahead of time.

### Negative

- Any code that touches the generator path inherits the no-IO discipline.
- Lint rule needed: forbid `Math.random` in `packages/core/**`.

### Risks accepted

- mulberry32 is not cryptographic. Acceptable: seeds are not secrets.
