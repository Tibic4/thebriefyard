# LANDSCAPE — Architecture Landscape

> Strategic document. Highest authority. Conflicts with ROADMAP or SPEC resolve here.
> Source design: `docs/superpowers/specs/2026-05-12-thebriefyard-design.md`.

## 1. Three-document system

| Doc              | Level             | Authority | Lifetime      |
| ---------------- | ----------------- | --------- | ------------- |
| LANDSCAPE (this) | L-1, L-2          | Highest   | Years         |
| ROADMAP          | Temporal          | Medium    | Quarters      |
| SPEC             | L-3 / partial L-4 | Lowest    | Current phase |

LANDSCAPE > ROADMAP > SPEC. No content duplication: SPEC references LANDSCAPE by name; LANDSCAPE never restates technical detail that lives in SPEC.

## 2. Capabilities (L-1)

| ID    | Capability             | Status v1        | Role                                        |
| ----- | ---------------------- | ---------------- | ------------------------------------------- |
| CAP-1 | Brief Generation       | Active           | Technical heart                             |
| CAP-2 | Discoverable Surface   | Active           | **Primary differentiator (traffic engine)** |
| CAP-3 | Permanence & Sharing   | Active           | Virality                                    |
| CAP-4 | Multilingual Reach     | Active (EN + PT) | Untapped market                             |
| CAP-5 | Community & Engagement | Roadmap v2       | Differentiation vs FakeClients              |
| CAP-6 | Content Contribution   | Roadmap v3       | Long-term moat                              |

## 3. Segments (L-2)

### Active in v1

- **SEG-A — Generator Core.** Pure TS, seeded PRNG, slot picker, template filler. `packages/core`.
- **SEG-B — Content Library.** Versioned JSON corpus, schema, build-time loader. `packages/content`.
- **SEG-C — Discoverable Web.** Next.js SSG + SEO scaffolding + sitemap + schema.org. `apps/web`.
- **SEG-D — Brief Permanence & Export.** Permalink routing, OG image (Edge), PDF/PNG export (Node).

### Planned

- **SEG-E** — Community Layer (v2, gated by LD-009).
- **SEG-F** — Editorial Content (v2).
- **SEG-G** — Contribution Pipeline (v3, gated by LD-010).
- **SEG-H** — Challenges & Streaks (v3).

## 4. Capability × Segment matrix

|       | A   | B   | C   | D   | E   | F   | G   | H   |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAP-1 | ●   | ◐   |     |     |     |     | ◐   |     |
| CAP-2 |     | ◐   | ●   | ◐   |     | ●   |     |     |
| CAP-3 | ◐   |     |     | ●   | ◐   |     |     | ◐   |
| CAP-4 | ◐   | ●   | ●   | ◐   |     | ◐   | ◐   |     |
| CAP-5 |     |     |     |     | ●   | ◐   |     | ●   |
| CAP-6 |     | ◐   |     |     |     |     | ●   |     |

● primary · ◐ partial

## 5. Landscape Decisions (LD)

- **LD-001 — Open core.** App MIT. Slot corpus CC BY-SA 4.0.
- **LD-002 — Zero LLM permanent through v3.** Philosophical; explicit.
- **LD-003 — SSG-first until > 500k pageviews/month.** Threshold in ROADMAP §9.
- **LD-004 — Bilingual from v1.** EN + PT-BR launched together. ES is v2 if PT validates.
- **LD-005 — No auth in v1.** Permalink = deterministic seed in URL.
- **LD-006 — No paid tier in v1 or v2.** Sponsor-of-the-month is the only monetization.
- **LD-007 — Do not compete in "AI-generated briefs".** Different category.
- **LD-008 — Single-region until > 100k MAU outside deployed region.**
- **LD-009 — SEG-E (Community) activation gate.** ≥ 30k organic clicks/month for 2 consecutive months AND ≥ 1,500 briefs/day AND ≥ 50 verified save/share/profile requests.
- **LD-010 — SEG-G (Contribution) activation gate.** Corpus stable 6 months AND ≥ 5 external contributors with accepted PRs.
- **LD-011 — Web only.** No iOS, Android, Electron. PWA installable is the ceiling.
- **LD-012 — Zero invasive tracking.** Plausible + Vercel Web Analytics only.
- **LD-013 — AI-drafted slot corpus, human-curated** (2026-05-12). Amends LD-002 by narrowing it: the runtime generator stays 100% combinatorial (no LLM in request path), but the slot corpus and editorial prose may be drafted with LLM assistance and human-reviewed per entry before merge. Public copy must describe the workflow honestly. See `docs/landscape-decisions/LD-013-ai-drafted-corpus-human-curated.md`.

## 6. Classification framework (used by the AI agent)

- **Tier 0** — bug / refactor. Direct PR.
- **Tier 1** — new L-3 / new dep / schema change. ADR required.
- **Tier 2** — new segment / capability change / contradicts an LD. LD proposal in
  `docs/landscape-decisions/` required. **No implementation without human approval.**

If in doubt, escalate.

## 7. Escalation to LD

A technical ADR becomes a LD proposal when it:

- Touches more than one active segment, OR
- Inverts a SPEC §3 non-goal, OR
- Creates a new segment in fact (even if the author didn't notice), OR
- Has projected maintenance cost > 2 weeks per quarter for > 12 months, OR
- Closes a future option (schema that locks out multi-tenancy, etc.).

## 8. Lifecycle

Revised at the end of each phase, and whenever a new LD is approved. Superseded LDs are
marked, never deleted.
