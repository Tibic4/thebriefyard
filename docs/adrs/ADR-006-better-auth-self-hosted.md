# ADR-006 — better-auth self-hosted (when auth arrives)

- **Date:** 2026-05-12
- **Status:** accepted (activated in v2, not v1)

## Context

v1 ships without authentication (LD-005). v2's SEG-E (community) requires user
accounts, profiles, and saved briefs. We need an option that runs cheaply,
respects privacy (LD-012), and avoids per-MAU pricing surprises.

## Decision

Use `better-auth` (open source, self-hosted) on top of Supabase Postgres when
auth becomes necessary.

## Consequences

### Positive

- No per-MAU cost. Acceptable as v2 scales.
- Owns the user table; no vendor lock-in.

### Negative

- Maintenance load: SSO integrations are not free.

### Risks accepted

- If SEG-F (enterprise) materialises (v3+), WorkOS sits on top for SSO
  specifically. Documented in ROADMAP §6.5.
