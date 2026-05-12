# ADR-005 — PDF via react-pdf (Node); OG/PNG via satori (Edge)

- **Date:** 2026-05-12
- **Status:** accepted

## Context

Brief export needs PDF and PNG. OG images need PNG generated at scale on a
per-permalink basis. Headless Chromium is the obvious tool but has cold-start
issues at the Edge.

## Decision

PDF: `@react-pdf/renderer` running in Node runtime route handler.
OG / share PNG: `satori` + `@vercel/og` running on the Edge runtime, cached one
year (the seed is immutable for a fixed contentVersion).

## Consequences

### Positive

- Edge render: < 100 ms cold, no browser to manage.
- PDF: react-pdf is small (~200 KB) compared to Chromium-in-Lambda.
- Both renderers consume the same `Brief` object — single source of truth.

### Negative

- Satori has limits on CSS features and font loading. We curate two fonts (a
  display sans for headlines and a mono for labels) and avoid filter effects.

### Risks accepted

- Visual parity between PDF and PNG requires effort. We accept slight divergence
  because they serve different contexts (print vs feed).
