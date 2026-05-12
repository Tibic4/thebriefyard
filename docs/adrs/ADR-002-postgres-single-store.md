# ADR-002 — Postgres as single store (no Redis/Mongo)

- **Date:** 2026-05-12
- **Status:** accepted

## Context

v1 needs minimal persistence: analytics (`brief_log`, `brief_reaction`). v2 adds
users, saved briefs, votes. v3 adds contribution PRs and moderation. Most v1
work is read-only against the JSON corpus.

## Decision

Use a single PostgreSQL 16 instance (Supabase managed). No Redis. No MongoDB.
No separate analytics warehouse until ROADMAP §6.3 threshold is measured.

## Consequences

### Positive

- One mental model, one connection pool, one set of credentials.
- Postgres FTS handles in-product search until volume justifies Meilisearch.
- Supabase free tier covers v1 traffic.

### Negative

- Sub-second analytics aggregations may slow as volume grows.

### Risks accepted

- Analytics scale: we will migrate to ClickHouse only when ROADMAP §6.3 threshold
  is observed in telemetry.
