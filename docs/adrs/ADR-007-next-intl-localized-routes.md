# ADR-007 — next-intl with localized routes

- **Date:** 2026-05-12
- **Status:** accepted

## Context

LD-004 ships EN + PT-BR from v1. Both locales must be indexable and have proper
hreflang. ES is planned for v2.

## Decision

Use `next-intl` with localized route prefixes (`/en/*`, `/pt/*`). EN is the
default served at `/` (no prefix) for SEO continuity. PT is served at `/pt`.
hreflang tags are emitted on every indexable page from day 1, even when only
EN content exists in Phase 1.

## Consequences

### Positive

- Standard Next.js routing model.
- One source of truth for translatable UI strings (`packages/content/locales/<l>/ui.json`).

### Negative

- Default-locale prefix vs no-prefix has known edge cases. We document the
  canonical convention in `docs/seo-playbook.md`.

### Risks accepted

- Locale negotiation runs in middleware. Small cold-start cost, well below
  Lighthouse budget.
