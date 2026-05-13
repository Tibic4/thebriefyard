# LD-013 — AI-drafted slot corpus, human-curated

- **Date:** 2026-05-12
- **Status:** accepted
- **Tier:** 2 (LANDSCAPE §6 — interprets/amends LD-002 and LD-007)
- **Supersedes:** —
- **Amends:** LD-002 (Zero LLM permanent through v3) — narrows scope
- **Approved by:** founder (Tibic4) on 2026-05-12

## Context

LD-002 declared "Zero LLM permanent through v3". The original intent — visible in
`docs/content-style-guide.md` and SPEC §3 — was to forbid:

1. LLM in the runtime generation path (the user-facing brief generator). This is
   still inviolable. The product is combinatorial slot grammar, not LLM output.
2. LLM-generated slot corpus shipped without human review.

Point 1 remains permanent. Point 2 collides with the practical economics of P4:
authoring 33 industry/job files (~250 words each = ~8,000 words of editorial
prose) plus scaling 6 shared slots to ~250 entries plus curating 3,000 seeds is
150–300 hours of solo work. Without an authoring assist, P4 cannot ship within
v1's timeline.

The founder evaluated the trade-off (2026-05-12 brainstorm) and chose to accept
LLM drafting as long as every entry is human-reviewed before merge.

## Decision

The slot corpus and editorial prose under `packages/content/locales/**` and
`docs/` may be **drafted with LLM assistance** (Claude, in this case), provided
that:

1. **Every entry is reviewed by a human (the founder)** before it lands on `main`.
   No bulk-merge without per-entry sight-read.
2. **The runtime generator (`@briefyard/core`)** continues to be 100% combinatorial
   — no LLM call in the request path. LD-002 still locks this part of the product.
3. **Public communication is honest.** The About page, FAQ, and any launch copy
   describe the workflow as "AI-drafted, human-curated" or equivalent. The
   marketing tagline "No AI, no paywall" must be replaced with a more accurate
   line ("Human-curated. No AI in the generator." is acceptable; "No AI" alone
   is not).
4. **Forbidden-terms list still enforced** (Task 5 of P4). LLM drafts can hallucinate
   stereotypes or trademarked names; the lint catches what review misses.
5. **The `contributor` field of `SlotEntry`** records the source for any entry:
   `"founder"` (hand-authored), `"founder-reviewed-ai-draft"` (drafted by the AI
   assistant and accepted by the founder), or `"<github-handle>"` (external
   contributor, v3+ via SEG-G). The default omitted value is interpreted as
   `"founder-reviewed-ai-draft"` for P4-era entries.

## Consequences

### Positive

- P4 ships in weeks, not months.
- Forbidden-terms gate (Task 5) becomes a real safety net rather than a polite
  test.
- Honest copy strengthens trust with the indie design community vs the AI-first
  category (FakeBrief, Briefly, Nikhara) — those vendors do NOT review per
  entry.

### Negative

- The original product line "Human-curated. No AI." was a clean marketing wedge
  vs AI-first competitors. We give that up. New wedge: deterministic permalinks
  - open corpus + per-entry human review.
- Some indie purists may discount the project. Acceptable.

### Risks accepted

- LLM bias / hallucination in entries. Mitigation: forbidden-terms list,
  per-entry review, `smoke-1000` already validates structural correctness, and
  the founder must explicitly sign off on each PR.
- Corpus uniformity: LLM-drafted entries can feel uniform in voice. Mitigation:
  founder rewrites any entry that reads "AI-uniform" before accepting.

## Alternatives considered

### A — Founder authors entirely (original LD-002 reading)

150–300h solo. v1 ships 6+ months late. Rejected on velocity grounds.

### B — Reduce P4 scope to 30 pairs (~600 URLs instead of 6,000)

Misses the SPEC §10.1 acceptance gate ("≥ 6,000 static pages"). Would require
amending the acceptance criteria. Founder rejected — the long-tail SEO surface is
the primary differentiator (CAP-2).

### C — Ship structure only (LD-002 unchanged); corpus authoring deferred indefinitely

The site launches with 1 hub. Effectively no traffic engine. Rejected — defeats
the v1 mission.

### D — Use AI but hide it in copy

Violates trust. Rejected on principle.

## Communication plan

- Update `docs/content-style-guide.md` to permit AI-assisted drafting with the
  review gate.
- Update `apps/web/app/[locale]/about/page.tsx` and the FAQ entry "Do you use
  AI to write the briefs?" to reflect the new workflow.
- Mention this LD in the launch announcement (Show HN, Product Hunt) — "the
  corpus is AI-drafted then reviewed entry by entry; the generator at runtime
  has no LLM in the path".
- Update the Manu outreach draft (`docs/outreach-manu.md`) to be transparent
  about this — Manu's Goodbrief is fully human-authored, so being honest about
  thebriefyard's workflow is courteous and correct.

## Notes

This LD specifically does NOT permit:

- LLM in `@briefyard/core` (the runtime generator). ADR-004 still locks this.
- LLM at request time anywhere. The product is determinism + permalink.
- LLM-generated content that bypasses the founder's review. The review is not
  optional.

If the project later shifts to a fully community-authored corpus (SEG-G in v3,
gated by LD-010), the workflow may go back to "human-authored only" naturally —
because external contributors won't draft via LLM either. LD-013 covers the v1
gap.
