# ROADMAP — Evolution & Versioning

> Temporal document. Defines how the product evolves and when each version enters
> construction. Conflicts with SPEC resolve here. Conflicts with LANDSCAPE: LANDSCAPE
> wins.

## 1. Versions

| Version | Scope                                                | Status        | Estimated duration  |
| ------- | ---------------------------------------------------- | ------------- | ------------------- |
| **v1**  | SEG-A + SEG-B + SEG-C + SEG-D in minimal viable form | **Active**    | 20 weeks (2 phases) |
| **v2**  | SEG-E + SEG-F + ES locale                            | Roadmap       | Triggered by LD-009 |
| **v3**  | SEG-G + SEG-H + additional locales                   | Roadmap       | Triggered by LD-010 |
| **v4+** | Speculative — multi-modal, network effects           | Not committed | —                   |

## 2. v1 scope

- **Phase 1 (weeks 1–10):** generator + 600 hubs + 6,000 indexable URLs, EN only.
- **Phase 2 (weeks 11–20):** PT-BR corpus, 30 + 40 guides, retention UX, sponsor slot,
  formal a11y audit, public launch.

Acceptance criteria binary, in SPEC §10.

## 3. Triggers to enter v2

v2 starts only if **either** set is satisfied.

**Set Community (activates SEG-E):**

- ≥ 30k organic clicks/month for 2 consecutive months.
- ≥ 1,500 briefs/day.
- ≥ 50 verifiable user requests for save/share/profile.

**Set Editorial (activates SEG-F):**

- Average CTR > 4% on hub pages.
- ≥ 3 inbound newsletters/podcasts referencing the site.

If neither set is satisfied 12 months post-launch: revisit positioning, not just timeline.

## 4. Versioning policy

### SDK / API

- **Patch:** bug fix.
- **Minor:** additive feature.
- **Major:** breaking change. 6-month deprecation notice. 12-month parallel support.

### Schema

- Additive between majors (new columns, new tables, new indexes).
- Breaking schema requires dual-write + backfill + cutover (template in §5).

### Events (analytics ingestion table)

- Append-only. Type with version suffix for new shapes.

### Content

- Slot corpus changes always bump `CONTENT_VERSION` (monotonic integer).
- Permalinks resolve to the matching `compiled/content.<v>.json`.

## 5. Migration playbook (template)

For any breaking change:

1. Backward-compatible deploy.
2. Dual-write.
3. Backfill (idempotent).
4. Switch reads.
5. Verification window (≥ 1 week).
6. Stop dual-write.
7. Cleanup.

## 6. Scaling thresholds

Tier 1 ADR proposals to introduce these are auto-rejected before the threshold is
measured.

### 6.1 Postgres queue → Redis / NATS

Keep Postgres queue (FOR UPDATE SKIP LOCKED) until:

- p95 `SELECT FOR UPDATE SKIP LOCKED` > 500 ms sustained 1 week, OR
- Queue depth > 50k jobs at peak, recurring.

### 6.2 Single-region → multi-region

Keep single-region until:

- 3+ enterprise customers requiring EU residency, OR
- p95 client→origin latency > 300 ms for > 10% of users.

### 6.3 Postgres → ClickHouse for analytics

Keep Postgres until:

- Analytics query p95 > 5 s, OR
- `event` table > 1B rows in one region.

### 6.4 Single Vercel project → sharded

Keep single until:

- Build time > 30 min (Vercel limit 45 min), OR
- Cold-start latency on Edge > 1 s p95.

### 6.5 better-auth → WorkOS / Auth0 SSO

Only if SEG-F (enterprise) activates AND maintaining SSO integrations in-house exceeds
the licensing cost of a managed provider.

## 7. Anti-pattern signals

If any of these appear, revisit strategy, not just delivery:

- 6 months post-launch < 10k organic clicks/month.
- Trace viewer (or its equivalent — Search Console + Plausible) goes unused by the
  founder for 2 weeks running.
- Self-hosted adoption zero after 3 months with decent docs (deferred — there is no
  self-hosted in v1).

## 8. Deprecation policy

- 6-month deprecation notice via `Deprecation` and `Sunset` HTTP headers (RFC 8594).
- Email all active API consumers (logged via `User-Agent`).
- HTTP 410 Gone after sunset with pointer to replacement.

## 9. Lifecycle of this document

- Reviewed at the end of each phase.
- Bumped minor at end of phase, major at end of version.
- Last reviewed: 2026-05-12.
