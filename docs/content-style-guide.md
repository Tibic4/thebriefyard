# Content Style Guide

How to write slot entries and editorial prose for thebriefyard. Applies to all
authors (founder, future contributors).

## Voice

- Direct, plain, professional. No corporate hedging.
- Specific over generic. Prefer "ships from a single farm in Minas Gerais"
  over "ships from a small farm".
- Confident, not cute. No emoji. No hype.

## Slot entries

- 1 to 280 characters.
- One sentence fragment, not a paragraph.
- Pronounceable in English (or Portuguese, for PT entries) without stumbling.
- No proper nouns of real companies, real people, real products.
- No slurs, no harmful stereotypes. Forbidden-terms list lives in
  `packages/content/__tests__/forbidden-terms.test.ts`.
- **Authorship workflow (LD-013, 2026-05-12 onward).** Entries may be drafted with
  LLM assistance, but every entry is read and approved by the founder before it
  lands on `main`. No bulk-merge without per-entry sight-read. The runtime
  generator stays 100% combinatorial — LD-002 still forbids LLM in the request
  path. See `docs/landscape-decisions/LD-013-ai-drafted-corpus-human-curated.md`.
- Set `contributor: "founder"` for hand-authored entries and
  `"founder-reviewed-ai-draft"` for AI-drafted entries that survived review.
  External contributions (v3+) use the GitHub handle.

## Slot weights

- Default weight = 1.
- Use weights to compose "no prefix / no suffix" patterns (blank entries
  weighted higher than a specific one — see `name-prefix.json`).
- Justify any weight ≥ 5 in a comment field or PR description.

## Templates

- Templates use `{{slot-name}}` placeholders.
- Every placeholder must reference an existing slot in the same locale.
- Templates should produce coherent prose across all slot combinations. Test
  by running the smoke generator (1,000 briefs).

## Localisation

- PT-BR is authored, not translated.
- Structural parity required: every slot present in `en/` must exist in `pt/`.
- Text content must read naturally in Brazilian Portuguese. Do not transliterate.

## Editorial prose (guides)

- 1,500 to 2,500 words per guide.
- Hemingway readability ≤ grade 9.
- Five or more internal links to hubs or other guides.
- Original; not summaries of other sources.
