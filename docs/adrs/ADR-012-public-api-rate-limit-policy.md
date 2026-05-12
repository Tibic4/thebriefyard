# ADR-012 — Public API rate-limit policy

- **Date:** 2026-05-12
- **Status:** accepted

## Context

`/api/brief` is open. The product's brand is "use it freely". But unbounded
abuse (scrapers, key-less integration) burns our Vercel quota and the Supabase
free tier.

## Decision

- Rate-limit at the Edge via Vercel Edge Config (token bucket per IP).
- Limits: 60 req/min, 600 req/hour, 5,000 req/day per IP.
- A `User-Agent` header is required; requests without one return HTTP 400.
- Public documentation at `/docs/api` (Phase 1) explains "use freely, attribute
  source, respect rate limits".
- Repeat offenders (≥ 3 ban-warning cycles) move to a per-IP blocklist
  refreshed daily.

## Consequences

### Positive

- Abusers gated without affecting normal users.
- Public attribution norm reinforces brand.

### Negative

- Rate limits at the Edge add ~1 ms latency.

### Risks accepted

- Aggressive scrapers can rotate IPs. Acceptable: they still hit aggregate
  quotas at the Vercel function level.
