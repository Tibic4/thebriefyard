# Architecture Decision Records

ADRs document technical decisions inside an active segment. They are Tier 1 in the
LANDSCAPE §6 framework. Strategic decisions (Tier 2) live in
`docs/landscape-decisions/` (not yet seeded — created when needed).

## How to add

```sh
pnpm adr:new "Title of the decision"
```

## Index

- ADR-001 — Next.js 14 App Router + TypeScript strict
- ADR-002 — Postgres as single store (no Redis/Mongo)
- ADR-003 — Slot corpus as JSON in git, not in DB
- ADR-004 — Pure deterministic generator (mulberry32, base36 seeds)
- ADR-005 — PDF via react-pdf (Node); OG/PNG via satori (Edge)
- ADR-006 — better-auth self-hosted when auth is introduced
- ADR-007 — next-intl with localized routes (`/en/*`, `/pt/*`)
- ADR-008 — Code MIT, slot corpus CC BY-SA 4.0
- ADR-009 — No ORM; postgres-js direct with Zod
- ADR-010 — Zod schema validates corpus in CI
- ADR-011 — Cookie and privacy policy (cookieless default)
- ADR-012 — Public API rate-limit policy
- ADR-013 — Husky pre-commit + lint-staged quality gate
