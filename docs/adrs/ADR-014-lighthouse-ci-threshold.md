# ADR-014 — Lighthouse CI thresholds

- **Date:** 2026-05-12
- **Status:** accepted

## Context

P3 ships the traffic-engine routes (CAP-2). To detect regressions in Web Vitals
or SEO completeness, we need an automated gate in CI. Lighthouse CI is the
standard, and our binary acceptance criteria (SPEC §10) already list four
category targets — without a gate, these get drift-checked only by hand.

## Decision

Run `@lhci/cli` on a 5-route reference set on every PR. Routes are all
**indexable** pages — ad-hoc permalinks are deliberately excluded because they
carry `noindex,follow` and Lighthouse correctly penalizes that (SEO ~0.66).
The exclusion is by design: ad-hoc permalinks are not part of the SEO surface.

1. `/` (home, EN)
2. `/pt` (home, PT)
3. `/brief/logo/food` (hub, EN)
4. `/faq` (static, with `FAQPage` JSON-LD)
5. `/about` (static)

Thresholds (mobile, throttled 4G):

- Performance ≥ 0.90
- SEO 1.00
- Accessibility ≥ 0.95
- Best Practices ≥ 0.95

A score below threshold fails CI.

Configuration lives at `apps/web/lighthouserc.json`. A new `lighthouse` job in
`.github/workflows/ci.yml` runs after `verify`.

## Consequences

### Positive

- Web Vitals regressions caught at PR time, not production.
- SEO completeness (canonical, hreflang, JSON-LD, meta tags) verified
  continuously.
- The reference route set covers every page type the v1 sitemap will surface.

### Negative

- Lighthouse runs add ~3 min to PR CI. Acceptable trade-off vs the cost of
  shipping a Web Vitals regression to production.

### Risks accepted

- Lighthouse is non-deterministic; we configure `numberOfRuns: 2` and accept
  the median. Flaky runs that fall just below threshold can be retried via
  GitHub Actions' built-in re-run.
- The reference set is small. P4 (corpus authoring) and post-launch can expand
  it without a new ADR (sampling, not threshold change).

## Notes

Reference: `docs/seo-playbook.md` defines the per-page-type SEO requirements
that the SEO score depends on. Reference: SPEC §10 (Phase 1 acceptance) for the
threshold rationale.
