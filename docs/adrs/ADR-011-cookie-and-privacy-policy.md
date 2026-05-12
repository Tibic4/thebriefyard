# ADR-011 — Cookie and privacy policy (cookieless default)

- **Date:** 2026-05-12
- **Status:** accepted

## Context

LD-012 forbids invasive tracking. PT/EU laws (LGPD, GDPR) require explicit
consent for non-essential cookies. We want minimal legal surface and maximal
respect for users.

## Decision

- Plausible (cookieless) + Vercel Web Analytics (cookieless) are the only
  analytics tools.
- No marketing pixels, no GA4, no GTM.
- No cookies set by us in v1.
- A short, plain-language privacy policy at `/privacy` and `/pt/privacidade`
  drafted at v1 launch and reviewed before PT-BR launch.
- IP addresses are never logged. User-Agent is hashed (truncated SHA-256) and
  stored only for abuse detection.

## Consequences

### Positive

- No cookie banner needed. Better UX. Better Lighthouse score.
- Less legal exposure.

### Negative

- Coarser analytics than third-party tools provide.

### Risks accepted

- If we ever ship a feature that requires a cookie (e.g. saved auth in v2),
  this ADR is amended and a banner is added under standard consent rules.
