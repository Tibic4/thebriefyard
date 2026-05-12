# ADR-001 — Next.js 14 App Router + TypeScript strict

- **Date:** 2026-05-12
- **Status:** accepted
- **Supersedes:** —
- **Superseded by:** —

## Context

We need a framework that handles SSG at scale (≥ 6,000 static pages with ISR),
deploys at the Edge for OG image generation, and stays maintainable as a solo
project. The product's primary differentiator is SEO surface area (CAP-2), so
HTML must be server-rendered out of the box, not hydrated from JSON.

## Decision

Use Next.js 14 with the App Router and TypeScript in strict mode (all `strict*`
flags enabled, plus `noUncheckedIndexedAccess` and `noImplicitReturns`).

## Consequences

### Positive

- SSG + ISR + Edge runtime all first-class.
- React Server Components reduce client JS for content-heavy pages.
- Vercel deployment is the path of least resistance.
- Large talent pool means future contributors can ramp fast.

### Negative

- Lock-in to Vercel ergonomics; alternative hosts (Cloudflare Pages) need adapters.
- App Router has more conceptual surface than Pages Router.

### Risks accepted

- Next.js 15 will arrive during construction; minor migration cost expected.

## Alternatives considered

### Astro

Better content/SSG story, smaller default JS payload. Rejected: the interactive
generator on the home page and future community layer (SEG-E) push us toward a
React-first stack.

### Remix

Strong server-side story. Rejected: SSG/ISR pattern is less idiomatic; Vercel
support weaker than Next.
