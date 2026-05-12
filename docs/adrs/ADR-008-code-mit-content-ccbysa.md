# ADR-008 — Code MIT, slot corpus CC BY-SA 4.0

- **Date:** 2026-05-12
- **Status:** accepted

## Context

LD-001 declared open core: code is open, business is the moat. But code and
corpus have different reuse dynamics. Code reuse is trivially valuable and we
want it spread (MIT). Corpus reuse is the actual moat — we want forks to
re-share their derivatives.

## Decision

- Code: MIT (`LICENSE` at repo root).
- Slot corpus (`packages/content/locales/**` and authored prose under
  `docs/`): Creative Commons Attribution-ShareAlike 4.0 International
  (`LICENSE-content` at repo root).

## Consequences

### Positive

- Code reuse with no friction.
- Forks of the corpus must remain CC BY-SA, so the ecosystem grows in the open.

### Negative

- Some companies refuse CC BY-SA content for compliance reasons. Acceptable;
  the v1 audience is independent designers.

### Risks accepted

- Re-evaluation to CC BY 4.0 stays open if a strong commercial-reuse demand
  emerges. Decision is reversible by switching license file forward — past
  contributions remain BY-SA per their original terms.
