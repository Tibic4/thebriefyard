# ADR-013 — Husky pre-commit + lint-staged quality gate

- **Date:** 2026-05-12
- **Status:** accepted

## Context

We want fast local feedback before commits. CI catches everything eventually,
but a 5-minute round trip on a typo is painful for a solo founder.

## Decision

Husky runs a pre-commit hook that invokes `lint-staged` (prettier on staged
files) and `turbo run typecheck test --filter='[HEAD^]'` (only changed
packages). Total expected runtime < 10 s on incremental commits.

## Consequences

### Positive

- Format and trivial typecheck errors caught instantly.
- Turbo cache reuses prior test results.

### Negative

- New contributors need to run `pnpm install` first. The `prepare` hook makes
  this automatic.

### Risks accepted

- The hook can be bypassed with `git commit --no-verify`. CI is the
  authoritative gate.
