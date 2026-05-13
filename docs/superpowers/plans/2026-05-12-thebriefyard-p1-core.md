# thebriefyard P1 â€” Generator Core (preceded by P2-stub) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **TDD discipline is non-negotiable in `packages/core`.** Write the failing test first, observe it fail for the right reason, then implement.

**Goal:** Ship a deterministic, byte-stable `generateBrief()` in `@briefyard/core` with â‰¥ 95% line coverage, validated against a minimal viable corpus (1 job Ã— 1 industry, EN only) authored in `@briefyard/content`. The generator becomes the technical heart (CAP-1, SEG-A) of every downstream feature: SSG hub pages (P3), permalinks, OG images, exports.

**Architecture:** Two phases sequenced in one plan because P2-stub blocks P1.

1. **P2-stub (Tasks 1â€“4) â€” minimal viable corpus.** Author 1 industry (`food`) Ã— 1 job (`logo`) corpus in `packages/content/locales/en/`. Adds Zod schemas for `SlotEntry`, `IndustryFile`, `JobFile`, `Brief`. Adds the `loader` that compiles JSON â†’ in-memory artefact and validates against schema. Adds content-lint test suite (schema-valid, length-bounds, no-duplicates). Bumps `CONTENT_VERSION` from 1 â†’ 2 because schema is being added (semantic change). No PT, no curated seeds yet, no smoke-1000 in this phase.
2. **P1 (Tasks 5â€“11) â€” generator core.** Mulberry32 PRNG with chi-squared distribution test. Seed encoding/decoding (base36, 6 chars). Weighted slot picker. Template filler. `generateBrief({job, industry, locale, seed?, contentVersion?, expanded?})` end-to-end. Determinism regression (100 iterations identical for fixed input). Smoke-1000 (1000 random briefs against the 1Ã—1 corpus, all pass `Brief.parse`). Coverage â‰¥ 95% lines on `packages/core`.

**Tech Stack:** No new dependencies. Existing: TS 5.4 strict, Vitest 2, Zod 3, `@briefyard/types` (existing JobId/IndustryId/LocaleId/Seed enums).

**Prerequisites:**

- P0 complete (this plan presumes the monorepo, CI, and `STATE.md = "P1 â€” Generator core (next)"`).
- `pnpm install` clean. `pnpm verify` exits 0 on `main`.
- Vercel preview live (already done at P0 close).

**Out of scope of this plan:**

- PT-BR corpus (Phase 2 of v1, separate plan).
- Curated-seeds JSON (P3 â€” Discoverable Web).
- Multi-industry corpus beyond 1Ã—1 (P4 â€” Corpus authoring + launch).
- Forbidden-terms test (deferred to P4 when corpus volume justifies; ADR-010 unaffected because the empty list is still a valid list).
- HTTP routes (`/api/brief`, etc.) â€” those land in P3.

---

## File map

Files created in this plan:

```
thebriefyard/
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ content/
â”‚   â”‚   â”œâ”€â”€ version.ts                                  # bumped to 2
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â”œâ”€â”€ schema.ts                               # Zod: SlotEntry, IndustryFile, JobFile, Brief
â”‚   â”‚   â”‚   â”œâ”€â”€ loader.ts                               # readCorpus(): validates & returns CompiledCorpus
â”‚   â”‚   â”‚   â””â”€â”€ index.ts                                # re-exports schema + loader + CONTENT_VERSION
â”‚   â”‚   â”œâ”€â”€ locales/en/
â”‚   â”‚   â”‚   â”œâ”€â”€ ui.json                                 # minimal UI strings (title, cta, footer)
â”‚   â”‚   â”‚   â”œâ”€â”€ slots/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ name-prefix.json                    # name grammar â€” prefix
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ name-core.json                      # name grammar â€” core (authored, NOT Wordlab)
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ name-suffix.json                    # name grammar â€” suffix
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ audiences.json
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ deadlines.json
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ emotions.json
â”‚   â”‚   â”‚   â”œâ”€â”€ industries/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ food.json                           # industry blurb + templates + industry-scoped slots
â”‚   â”‚   â”‚   â””â”€â”€ jobs/
â”‚   â”‚   â”‚       â””â”€â”€ logo.json                           # job blurb + jobDescriptionTemplates + jobSlots
â”‚   â”‚   â””â”€â”€ __tests__/
â”‚   â”‚       â”œâ”€â”€ schema-valid.test.ts                    # every JSON parses against Zod
â”‚   â”‚       â”œâ”€â”€ length-bounds.test.ts                   # all entries 1..280 chars
â”‚   â”‚       â”œâ”€â”€ no-duplicates.test.ts                   # no entry text in two slots within same locale
â”‚   â”‚       â””â”€â”€ loader.test.ts                          # readCorpus() round-trip
â”‚   â””â”€â”€ core/
â”‚       â”œâ”€â”€ src/
â”‚       â”‚   â”œâ”€â”€ prng.ts                                 # mulberry32
â”‚       â”‚   â”œâ”€â”€ seed.ts                                 # encode/decode seed (base36 6 chars)
â”‚       â”‚   â”œâ”€â”€ slot-picker.ts                          # weighted random pick
â”‚       â”‚   â”œâ”€â”€ template.ts                             # {{slot}} placeholder filler
â”‚       â”‚   â”œâ”€â”€ generate.ts                             # generateBrief()
â”‚       â”‚   â””â”€â”€ index.ts                                # public exports
â”‚       â””â”€â”€ __tests__/
â”‚           â”œâ”€â”€ prng.test.ts                            # determinism + chi-squared distribution
â”‚           â”œâ”€â”€ seed.test.ts                            # encode/decode round-trip + format
â”‚           â”œâ”€â”€ slot-picker.test.ts                     # weighted distribution
â”‚           â”œâ”€â”€ template.test.ts                        # placeholder substitution + missing-slot error
â”‚           â”œâ”€â”€ generate.test.ts                        # end-to-end generateBrief
â”‚           â”œâ”€â”€ determinism.test.ts                     # 100 iterations identical
â”‚           â””â”€â”€ smoke-1000.test.ts                      # 1000 random briefs all parse
```

Files modified:

```
- packages/content/package.json          # add Zod runtime dep
- packages/content/src/index.ts          # re-export schema + loader
- packages/content/version.ts            # CONTENT_VERSION 1 â†’ 2
- packages/core/package.json             # add @briefyard/content workspace dep
- packages/core/vitest.config.ts         # raise coverage thresholds to 95
- STATE.md                               # mark P1 complete at end
```

---

## Phase A â€” P2-stub (corpus 1Ã—1 EN)

Authoring discipline (read once, follow for every entry):

- Subagent: invoke `content-curator` (defined in `.claude/agents/content-curator.md`) when authoring. It loads `docs/content-style-guide.md` automatically.
- No LLM-bulk generation; each entry is hand-authored to fit the slot grammar.
- 1â€“280 chars per entry.
- No proper nouns of real companies/people/products.
- No emoji, no hype.
- The corpus must yield coherent prose across all combinations â€” verify by running the generator's smoke test at the end of P1.

### Task 1 â€” Zod schemas in `@briefyard/content`

**Files:**

- Create: `packages/content/src/schema.ts`
- Modify: `packages/content/package.json` (add `zod` dependency)
- Modify: `packages/content/src/index.ts` (re-export schemas)

- [x] **Step 1: Add `zod` to `@briefyard/content`**

Run:

```
pnpm --filter @briefyard/content add zod@^3.23.8
```

Expected: lockfile updated, dependency listed.

- [x] **Step 2: Write `packages/content/src/schema.ts`**

Schemas mirror SPEC Â§9.2 verbatim. Reuses `JobId`, `IndustryId`, `LocaleId` from `@briefyard/types`.

```ts
import { z } from 'zod';

import { IndustryId, JobId, LocaleId, Seed } from '@briefyard/types';

export const SlotEntry = z.object({
  text: z.string().min(1).max(280),
  weight: z.number().int().positive().default(1),
  tags: z.array(z.string()).optional(),
  contributor: z.string().optional(),
});
export type SlotEntry = z.infer<typeof SlotEntry>;

export const Template = z.object({
  pattern: z.string().min(1),
  minLength: z.number().int().positive().optional(),
});
export type Template = z.infer<typeof Template>;

export const IndustryFile = z.object({
  id: IndustryId,
  locale: LocaleId,
  displayName: z.string().min(1),
  blurb: z.string().min(200).max(2000),
  slots: z.record(z.string(), z.array(SlotEntry).min(1)),
  templates: z.array(Template).min(1),
  seoTitle: z.string().min(20).max(70),
  seoDescription: z.string().min(50).max(160),
});
export type IndustryFile = z.infer<typeof IndustryFile>;

export const JobFile = z.object({
  id: JobId,
  locale: LocaleId,
  displayName: z.string().min(1),
  blurb: z.string().min(200).max(2000),
  jobDescriptionTemplates: z.array(z.object({ pattern: z.string().min(1) })).min(1),
  jobSlots: z.record(z.string(), z.array(SlotEntry).min(1)),
  seoTitle: z.string().min(20).max(70),
  seoDescription: z.string().min(50).max(160),
});
export type JobFile = z.infer<typeof JobFile>;

export const SharedSlots = z.record(z.string(), z.array(SlotEntry).min(1));
export type SharedSlots = z.infer<typeof SharedSlots>;

export const Brief = z.object({
  seed: Seed,
  job: JobId,
  industry: IndustryId,
  locale: LocaleId,
  contentVersion: z.number().int().positive(),
  company: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    audience: z.string().min(1),
    values: z.string().optional(),
  }),
  deliverable: z.object({
    description: z.string().min(1),
    constraints: z.array(z.string()),
    useCases: z.array(z.string()),
  }),
  deadline: z.string().min(1),
  expanded: z
    .object({
      competitiveContext: z.string().optional(),
      creativeConstraint: z.string().optional(),
      moodWords: z.array(z.string()).optional(),
      forbidden: z.array(z.string()).optional(),
    })
    .optional(),
  generatedAt: z.string().datetime(),
});
export type Brief = z.infer<typeof Brief>;
```

- [x] **Step 3: Re-export from `packages/content/src/index.ts`**

Append:

```ts
export * from './schema';
export * from './loader';
```

- [x] **Step 4: Bump `CONTENT_VERSION` from 1 to 2**

Edit `packages/content/version.ts`:

```ts
export const CONTENT_VERSION = 2 as const;
```

Update the existing smoke test in `packages/content/__tests__/smoke.test.ts` to expect `2`.

- [x] **Step 5: Verify**

Run:

```
pnpm --filter @briefyard/content typecheck
pnpm --filter @briefyard/content test
```

Expected: both exit 0. Smoke test passes with `CONTENT_VERSION === 2`.

- [x] **Step 6: Commit**

Run:

```
git add packages/content
git commit -m "feat(content): add Zod schemas (SlotEntry, IndustryFile, JobFile, Brief), bump CONTENT_VERSION to 2"
```

### Task 2 â€” Author the 1Ã—1 EN corpus

Sub-agent: dispatch `content-curator` for each file. It will read `docs/content-style-guide.md` first, then write entries. Number of entries per slot is intentionally small (10â€“15) to keep diffing cheap; the smoke-1000 test still works because (10^k) combinations across k slots is well above 1000.

**Files:**

- Create: `packages/content/locales/en/ui.json`
- Create: `packages/content/locales/en/slots/{name-prefix,name-core,name-suffix,audiences,deadlines,emotions}.json`
- Create: `packages/content/locales/en/industries/food.json`
- Create: `packages/content/locales/en/jobs/logo.json`

- [x] **Step 1: Write `ui.json`** (minimal â€” title, generate button, footer attribution)

```json
{
  "site.title": "thebriefyard",
  "site.tagline": "Practice briefs for designers. No AI, no paywall.",
  "cta.generate": "Generate brief",
  "footer.credit": "Open source on GitHub. Slot corpus CC BY-SA 4.0."
}
```

- [x] **Step 2: Write the three name-grammar slots**

These produce `prefix + core + suffix`. Blank entries (weight â‰¥ 5) make "no prefix / no suffix" likely, so most names are bare cores.

`name-prefix.json` â€” 10 entries, including 5 blanks.
`name-core.json` â€” 15 distinct authored cores. NOT from Wordlab. Phonotactics: 2â€“3 syllables, easy to pronounce in EN and PT.
`name-suffix.json` â€” 10 entries including 5 blanks; non-blank options include `" Co."`, `" Studio"`, `" Works"`, `" & Sons"`, `" Lab"`.

Schema reminder (from Task 1):

```json
[
  { "text": "Black ", "weight": 1 },
  { "text": "", "weight": 5 }
]
```

The content-curator subagent must produce all 35 entries in one shot, then we read & spot-check.

- [x] **Step 3: Write the three shared slots**

`audiences.json` â€” 12 entries: parents, college students, weekend cooks, urban cyclists, retirees on a budget, restaurant owners, food bloggers, vegans, busy professionals, tourists, families with young kids, fitness enthusiasts.

`deadlines.json` â€” 9 entries: "2 days", "3 days", "4 days", "5 days", "6 days", "1 week", "10 days", "2 weeks", "3 weeks". Weight 1 each.

`emotions.json` â€” 12 entries: bravery, comfort, delight, elegance, freshness, generosity, mystery, nostalgia, security, simplicity, warmth, wonder.

- [x] **Step 4: Write `industries/food.json`**

```json
{
  "id": "food",
  "locale": "en",
  "displayName": "Food & Beverage",
  "blurb": "<200â€“400 words: written by content-curator, describing the design considerations of designing for food brands. Reference packaging, signage, menu typography, sensory associations, regulation. Hemingway readability â‰¤ grade 9. End with a sentence inviting the practice exercise.>",
  "slots": {
    "cuisine": [
      { "text": "vegan", "weight": 1 },
      { "text": "Italian", "weight": 1 },
      { "text": "Mexican", "weight": 1 },
      { "text": "all-American", "weight": 1 },
      { "text": "Indian", "weight": 1 },
      { "text": "low-calorie", "weight": 1 },
      { "text": "gluten-free", "weight": 1 },
      { "text": "fusion", "weight": 1 },
      { "text": "regional Brazilian", "weight": 1 },
      { "text": "plant-based", "weight": 1 }
    ],
    "product": [
      { "text": "soft drinks", "weight": 1 },
      { "text": "snacks", "weight": 1 },
      { "text": "frozen meals", "weight": 1 },
      { "text": "pastries", "weight": 1 },
      { "text": "desserts", "weight": 1 },
      { "text": "fresh juices", "weight": 1 },
      { "text": "ready-to-eat lunches", "weight": 1 },
      { "text": "specialty coffee", "weight": 1 }
    ],
    "process": [
      { "text": "a secret family recipe", "weight": 1 },
      { "text": "fresh local ingredients", "weight": 1 },
      { "text": "love and attention to detail", "weight": 1 },
      { "text": "five generations of know-how", "weight": 1 },
      { "text": "small-batch craftsmanship", "weight": 1 }
    ],
    "distribution": [
      { "text": "shipped directly to your home", "weight": 1 },
      { "text": "available in stores nationwide", "weight": 1 },
      { "text": "served in cafÃ©s across the country", "weight": 1 },
      { "text": "sold at weekend farmers' markets", "weight": 1 }
    ]
  },
  "templates": [
    {
      "pattern": "We are a company that makes and distributes {{cuisine}} {{product}}. Our main product is made with {{process}} and {{distribution}}. Our target audience is {{audiences}}. We want to convey a sense of {{emotions}}, while at the same time being approachable."
    }
  ],
  "seoTitle": "Logo Design Brief Generator for Food Brands â€” thebriefyard",
  "seoDescription": "Practice realistic logo briefs for food and beverage brands. Reproducible, shareable, no AI. Generate a unique brief in one click."
}
```

The content-curator must replace the `<...>` blurb with real authored prose (~250 words).

- [x] **Step 5: Write `jobs/logo.json`**

```json
{
  "id": "logo",
  "locale": "en",
  "displayName": "Logo design",
  "blurb": "<200â€“400 words: design considerations for logo work â€” symbol vs wordmark, scalability, monochrome, use cases, semiotics. Same authoring rules as industries/food.json.>",
  "jobDescriptionTemplates": [
    {
      "pattern": "You must create a logo using the information given in this brief. They would prefer {{logoStyle}} that uses the colour {{colour}}. The logo will be {{useCase}}. Take into account the company's values and preferences, and make sure it works for the planned use cases."
    }
  ],
  "jobSlots": {
    "logoStyle": [
      { "text": "a combination mark", "weight": 1 },
      { "text": "a wordmark", "weight": 1 },
      { "text": "a lettermark", "weight": 1 },
      { "text": "a pictorial mark", "weight": 1 },
      { "text": "an emblem logo", "weight": 1 },
      { "text": "an abstract logo mark", "weight": 1 },
      { "text": "a mascot logo", "weight": 1 }
    ],
    "colour": [
      { "text": "black", "weight": 1 },
      { "text": "white", "weight": 1 },
      { "text": "red", "weight": 1 },
      { "text": "orange", "weight": 1 },
      { "text": "yellow", "weight": 1 },
      { "text": "green", "weight": 1 },
      { "text": "blue", "weight": 1 },
      { "text": "purple", "weight": 1 },
      { "text": "grey", "weight": 1 }
    ],
    "useCase": [
      { "text": "embroidered on uniforms", "weight": 1 },
      { "text": "printed on the side of vehicles", "weight": 1 },
      { "text": "used on the company website", "weight": 1 },
      { "text": "stamped on packaging", "weight": 1 },
      { "text": "displayed on storefront signage", "weight": 1 }
    ]
  },
  "seoTitle": "Logo Design Brief Generator â€” Practice Briefs for Designers",
  "seoDescription": "Generate realistic logo design briefs to practice your portfolio work. Human-curated, reproducible, free."
}
```

- [x] **Step 6: Commit the corpus**

Run:

```
git add packages/content/locales
git commit -m "feat(content): seed 1x1 EN corpus (logo x food) for P1 generator validation"
```

### Task 3 â€” Loader

Loader reads JSON files at runtime (in tests + dev), validates against schemas, and returns a `CompiledCorpus` shape that `@briefyard/core` consumes.

**Files:**

- Create: `packages/content/src/loader.ts`

- [x] **Step 1: Write loader signature & types**

```ts
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { IndustryId, JobId, LocaleId } from '@briefyard/types';

import { IndustryFile, JobFile, SharedSlots, type SlotEntry } from './schema';
import { CONTENT_VERSION } from '../version';

export interface CompiledCorpus {
  contentVersion: number;
  locale: LocaleId;
  sharedSlots: Record<string, SlotEntry[]>;
  industries: Partial<Record<IndustryId, ReturnType<typeof IndustryFile.parse>>>;
  jobs: Partial<Record<JobId, ReturnType<typeof JobFile.parse>>>;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesRoot = join(__dirname, '..', 'locales');
```

- [x] **Step 2: Implement `readCorpus(locale: LocaleId): CompiledCorpus`**

Reads `locales/<locale>/slots/*.json` (each is a `SlotEntry[]`), `locales/<locale>/industries/*.json` (each parsed by `IndustryFile`), `locales/<locale>/jobs/*.json` (each parsed by `JobFile`). Throws on any validation failure with file path in the error.

- [x] **Step 3: Write `__tests__/loader.test.ts`**

TDD discipline: write the test first describing the expected shape, then run (red), then implement loader (green).

```ts
import { describe, expect, it } from 'vitest';

import { CONTENT_VERSION } from '../version';
import { readCorpus } from '../src/loader';

describe('readCorpus', () => {
  it('loads the EN 1x1 corpus and returns a CompiledCorpus', () => {
    const corpus = readCorpus('en');
    expect(corpus.contentVersion).toBe(CONTENT_VERSION);
    expect(corpus.locale).toBe('en');
    expect(corpus.industries.food).toBeDefined();
    expect(corpus.jobs.logo).toBeDefined();
    expect(Object.keys(corpus.sharedSlots)).toContain('audiences');
    expect(Object.keys(corpus.sharedSlots)).toContain('deadlines');
    expect(Object.keys(corpus.sharedSlots)).toContain('emotions');
    expect(Object.keys(corpus.sharedSlots)).toContain('name-prefix');
    expect(Object.keys(corpus.sharedSlots)).toContain('name-core');
    expect(Object.keys(corpus.sharedSlots)).toContain('name-suffix');
  });

  it('food industry uses slots that exist in either sharedSlots or its own slots', () => {
    const corpus = readCorpus('en');
    const food = corpus.industries.food!;
    const placeholders = food.templates.flatMap((t) =>
      [...t.pattern.matchAll(/\{\{(\w[\w-]*)\}\}/g)].map((m) => m[1]!),
    );
    for (const p of placeholders) {
      expect(food.slots[p] ?? corpus.sharedSlots[p]).toBeDefined();
    }
  });

  it('logo job placeholders all resolve', () => {
    const corpus = readCorpus('en');
    const logo = corpus.jobs.logo!;
    const placeholders = logo.jobDescriptionTemplates.flatMap((t) =>
      [...t.pattern.matchAll(/\{\{(\w[\w-]*)\}\}/g)].map((m) => m[1]!),
    );
    for (const p of placeholders) {
      expect(logo.jobSlots[p] ?? corpus.sharedSlots[p]).toBeDefined();
    }
  });
});
```

- [x] **Step 4: Run red â†’ implement â†’ green**

Sequence:

```
pnpm --filter @briefyard/content test --run loader  # RED â€” file does not exist
# implement loader.ts
pnpm --filter @briefyard/content test --run loader  # GREEN
```

- [x] **Step 5: Commit**

Run:

```
git add packages/content/src/loader.ts packages/content/__tests__/loader.test.ts
git commit -m "feat(content): add corpus loader with placeholder resolution test"
```

### Task 4 â€” Content-lint suite

Three lints required by ADR-010 + `docs/content-style-guide.md`:

- `schema-valid` â€” every JSON file parses
- `length-bounds` â€” every entry's text is 1..280 chars
- `no-duplicates` â€” no entry text appears in two slot keys within the same locale

(The `parity` test is deferred to Phase 2 when PT corpus exists. The `forbidden-terms` test is deferred to P4 with the full corpus.)

**Files:**

- Create: `packages/content/__tests__/{schema-valid,length-bounds,no-duplicates}.test.ts`

- [x] **Step 1: Write `schema-valid.test.ts`**

Reads every JSON file in `locales/en/**`, attempts `JSON.parse` then routes to the right Zod schema based on path:

- `slots/*.json` â†’ `z.array(SlotEntry)`
- `industries/*.json` â†’ `IndustryFile`
- `jobs/*.json` â†’ `JobFile`
- `ui.json` â†’ `z.record(z.string(), z.string())`

Each parse failure produces a test failure naming the file and the Zod error.

- [x] **Step 2: Write `length-bounds.test.ts`**

Walks every `SlotEntry.text` from every slot file and every industry/job slot, asserting `text.length >= 1 && text.length <= 280`. Failure message includes file + entry index.

- [x] **Step 3: Write `no-duplicates.test.ts`**

Builds a `Map<string, string>` of `text` â†’ `slotKey`. On collision, the test fails with both keys and the duplicated text. Note: blank `""` entries in `name-prefix` and `name-suffix` legitimately collide â€” exempt empty strings from the check.

- [x] **Step 4: Run all three**

```
pnpm --filter @briefyard/content test
```

Expected: schema-valid, length-bounds, no-duplicates, loader, smoke â€” 5 suites pass.

- [ ] **Step 5: Commit**

Run:

```
git add packages/content/__tests__
git commit -m "test(content): add schema-valid, length-bounds, no-duplicates content lints"
```

---

## Phase B â€” P1 (generator core)

TDD is mandatory throughout this phase. Pattern for every module: write the test, watch it fail for the _right_ reason (not "import error"), implement minimum code, watch it pass, refactor.

### Task 5 â€” Mulberry32 PRNG

ADR-004: deterministic, no IO, no `Math.random`, no `Date.now()` in dependency tree.

**Files:**

- Create: `packages/core/src/prng.ts`
- Create: `packages/core/__tests__/prng.test.ts`

- [ ] **Step 1: Write the test first**

```ts
import { describe, expect, it } from 'vitest';

import { mulberry32 } from '../src/prng';

describe('mulberry32', () => {
  it('returns a function that yields values in [0, 1)', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('is deterministic â€” same seed yields the same sequence', () => {
    const a = mulberry32(123456);
    const b = mulberry32(123456);
    for (let i = 0; i < 1000; i++) {
      expect(a()).toBe(b());
    }
  });

  it('different seeds yield different first values', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it('passes a coarse chi-squared uniformity test on 10,000 draws across 10 buckets', () => {
    const rng = mulberry32(0xdeadbeef);
    const buckets = new Array(10).fill(0);
    const N = 10_000;
    for (let i = 0; i < N; i++) {
      const idx = Math.floor(rng() * 10);
      buckets[idx]++;
    }
    const expected = N / 10;
    const chi = buckets.reduce((acc, observed) => {
      const diff = observed - expected;
      return acc + (diff * diff) / expected;
    }, 0);
    // critical value at df=9, alpha=0.001 is ~27.88; we accept anything below 30
    expect(chi).toBeLessThan(30);
  });
});
```

- [ ] **Step 2: Implement `mulberry32`**

Standard reference (public domain):

```ts
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function rng(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [ ] **Step 3: ESLint rule against `Math.random` in core**

Add to `packages/core/.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  extends: ['@briefyard/eslint-config'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "MemberExpression[object.name='Math'][property.name='random']",
        message: 'Math.random is forbidden in @briefyard/core (ADR-004). Use the seeded PRNG.',
      },
    ],
  },
};
```

- [ ] **Step 4: Verify**

```
pnpm --filter @briefyard/core test
pnpm --filter @briefyard/core lint
```

Both exit 0.

- [ ] **Step 5: Commit**

```
git add packages/core/src/prng.ts packages/core/__tests__/prng.test.ts packages/core/.eslintrc.cjs
git commit -m "feat(core): add mulberry32 PRNG with chi-squared uniformity test (ADR-004)"
```

### Task 6 â€” Seed encoding (base36, 6 chars)

**Files:**

- Create: `packages/core/src/seed.ts`
- Create: `packages/core/__tests__/seed.test.ts`

- [ ] **Step 1: Write the test first**

```ts
import { describe, expect, it } from 'vitest';

import { generateSeed, seedToInt } from '../src/seed';
import { mulberry32 } from '../src/prng';

describe('seed', () => {
  it('generateSeed produces a 6-char base36 string', () => {
    for (let i = 0; i < 50; i++) {
      const s = generateSeed();
      expect(s).toMatch(/^[0-9a-z]{6}$/);
    }
  });

  it('seedToInt is deterministic for the same string', () => {
    expect(seedToInt('a7f3c2')).toBe(seedToInt('a7f3c2'));
  });

  it('seedToInt produces different ints for different seeds', () => {
    expect(seedToInt('aaaaaa')).not.toBe(seedToInt('bbbbbb'));
  });

  it('seedToInt feeds mulberry32 reproducibly', () => {
    const a = mulberry32(seedToInt('abc123'));
    const b = mulberry32(seedToInt('abc123'));
    expect(a()).toBe(b());
  });
});
```

- [ ] **Step 2: Implement**

```ts
import { randomBytes } from 'node:crypto';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

export function generateSeed(): string {
  const bytes = randomBytes(6);
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += ALPHABET[bytes[i]! % 36];
  }
  return out;
}

export function seedToInt(seed: string): number {
  // FNV-1a 32-bit over the seed string. Stable, fast, no Math.random.
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
```

- [ ] **Step 3: Verify + commit**

```
pnpm --filter @briefyard/core test
git add packages/core/src/seed.ts packages/core/__tests__/seed.test.ts
git commit -m "feat(core): seed encoding (base36 6-char) and FNV-1a hash to PRNG state"
```

### Task 7 â€” Weighted slot picker

**Files:**

- Create: `packages/core/src/slot-picker.ts`
- Create: `packages/core/__tests__/slot-picker.test.ts`

- [ ] **Step 1: Test first**

```ts
import { describe, expect, it } from 'vitest';

import { mulberry32 } from '../src/prng';
import { pickWeighted } from '../src/slot-picker';

describe('pickWeighted', () => {
  it('picks an element from the array', () => {
    const rng = mulberry32(1);
    const items = [
      { text: 'a', weight: 1 },
      { text: 'b', weight: 1 },
    ];
    const picked = pickWeighted(items, rng);
    expect(['a', 'b']).toContain(picked.text);
  });

  it('respects weights â€” item with weight 99 dominates over 1', () => {
    const rng = mulberry32(7);
    const items = [
      { text: 'rare', weight: 1 },
      { text: 'common', weight: 99 },
    ];
    const counts = { rare: 0, common: 0 };
    for (let i = 0; i < 1000; i++) {
      counts[pickWeighted(items, rng).text as 'rare' | 'common']++;
    }
    // expected ~10 vs ~990; allow generous tolerance
    expect(counts.common).toBeGreaterThan(counts.rare * 5);
  });

  it('throws on an empty array', () => {
    const rng = mulberry32(1);
    expect(() => pickWeighted([], rng)).toThrow();
  });

  it('is deterministic for the same RNG sequence', () => {
    const items = [
      { text: 'a', weight: 1 },
      { text: 'b', weight: 1 },
      { text: 'c', weight: 1 },
    ];
    const a = pickWeighted(items, mulberry32(99));
    const b = pickWeighted(items, mulberry32(99));
    expect(a.text).toBe(b.text);
  });
});
```

- [ ] **Step 2: Implement**

```ts
export interface Weighted {
  text: string;
  weight: number;
}

export function pickWeighted<T extends Weighted>(items: readonly T[], rng: () => number): T {
  if (items.length === 0) {
    throw new Error('pickWeighted: items array is empty');
  }
  let total = 0;
  for (const it of items) total += it.weight;
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight;
    if (r < 0) return it;
  }
  // Floating-point edge case â€” return the last element.
  return items[items.length - 1]!;
}
```

- [ ] **Step 3: Verify + commit**

```
pnpm --filter @briefyard/core test
git add packages/core/src/slot-picker.ts packages/core/__tests__/slot-picker.test.ts
git commit -m "feat(core): weighted slot picker with deterministic RNG"
```

### Task 8 â€” Template filler

**Files:**

- Create: `packages/core/src/template.ts`
- Create: `packages/core/__tests__/template.test.ts`

- [ ] **Step 1: Test first**

```ts
import { describe, expect, it } from 'vitest';

import { fillTemplate } from '../src/template';

describe('fillTemplate', () => {
  it('substitutes a single placeholder', () => {
    expect(fillTemplate('Hello {{name}}', { name: 'world' })).toBe('Hello world');
  });

  it('substitutes multiple', () => {
    expect(fillTemplate('{{a}} and {{b}}', { a: 'x', b: 'y' })).toBe('x and y');
  });

  it('throws on a missing slot', () => {
    expect(() => fillTemplate('Hello {{missing}}', {})).toThrow(/missing/);
  });

  it('leaves non-placeholder braces alone', () => {
    expect(fillTemplate('a { b } c', {})).toBe('a { b } c');
  });
});
```

- [ ] **Step 2: Implement**

```ts
export function fillTemplate(pattern: string, values: Readonly<Record<string, string>>): string {
  return pattern.replace(/\{\{(\w[\w-]*)\}\}/g, (_match, key: string) => {
    if (!(key in values)) {
      throw new Error(`fillTemplate: missing slot "${key}"`);
    }
    return values[key]!;
  });
}
```

- [ ] **Step 3: Verify + commit**

```
pnpm --filter @briefyard/core test
git add packages/core/src/template.ts packages/core/__tests__/template.test.ts
git commit -m "feat(core): template filler with strict missing-slot error"
```

### Task 9 â€” `generateBrief()` end-to-end

**Files:**

- Create: `packages/core/src/generate.ts`
- Create: `packages/core/__tests__/generate.test.ts`
- Modify: `packages/core/src/index.ts` (re-export public API)
- Modify: `packages/core/package.json` (add `@briefyard/content` dep)

- [ ] **Step 1: Add `@briefyard/content` workspace dep to core**

Run:

```
pnpm --filter @briefyard/core add @briefyard/content@workspace:*
```

- [ ] **Step 2: Write the test first**

```ts
import { describe, expect, it } from 'vitest';

import { Brief } from '@briefyard/content';

import { generateBrief } from '../src/generate';

describe('generateBrief', () => {
  it('produces a valid Brief for (logo, food, en, seed=a7f3c2)', () => {
    const brief = generateBrief({
      job: 'logo',
      industry: 'food',
      locale: 'en',
      seed: 'a7f3c2',
    });
    const parsed = Brief.safeParse(brief);
    if (!parsed.success) console.error(parsed.error.format());
    expect(parsed.success).toBe(true);
    expect(brief.seed).toBe('a7f3c2');
    expect(brief.job).toBe('logo');
    expect(brief.industry).toBe('food');
    expect(brief.locale).toBe('en');
  });

  it('generates a fresh seed when none is provided', () => {
    const brief = generateBrief({ job: 'logo', industry: 'food', locale: 'en' });
    expect(brief.seed).toMatch(/^[0-9a-z]{6}$/);
  });

  it('company.name is non-empty after assembling prefix + core + suffix', () => {
    const brief = generateBrief({ job: 'logo', industry: 'food', locale: 'en', seed: 'aaaaaa' });
    expect(brief.company.name.trim().length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Implement `generateBrief`**

Algorithm follows SPEC Â§6.3 exactly:

```ts
import { readCorpus, type CompiledCorpus, Brief } from '@briefyard/content';
import { CONTENT_VERSION } from '@briefyard/content/version';
import type { IndustryId, JobId, LocaleId } from '@briefyard/types';

import { mulberry32 } from './prng';
import { generateSeed, seedToInt } from './seed';
import { pickWeighted } from './slot-picker';
import { fillTemplate } from './template';

export interface GenerateInput {
  job: JobId;
  industry: IndustryId;
  locale: LocaleId;
  seed?: string;
  contentVersion?: number;
  expanded?: boolean;
}

const corpusCache = new Map<LocaleId, CompiledCorpus>();
function corpusFor(locale: LocaleId): CompiledCorpus {
  let c = corpusCache.get(locale);
  if (!c) {
    c = readCorpus(locale);
    corpusCache.set(locale, c);
  }
  return c;
}

export function generateBrief(input: GenerateInput): Brief {
  const seed = input.seed ?? generateSeed();
  const contentVersion = input.contentVersion ?? CONTENT_VERSION;
  const rng = mulberry32(seedToInt(seed));
  const corpus = corpusFor(input.locale);

  const industry = corpus.industries[input.industry];
  if (!industry) throw new Error(`generateBrief: industry "${input.industry}" not in corpus`);
  const job = corpus.jobs[input.job];
  if (!job) throw new Error(`generateBrief: job "${input.job}" not in corpus`);

  // Compose name: prefix + core + suffix from sharedSlots.
  const namePrefix = pickWeighted(corpus.sharedSlots['name-prefix']!, rng).text;
  const nameCore = pickWeighted(corpus.sharedSlots['name-core']!, rng).text;
  const nameSuffix = pickWeighted(corpus.sharedSlots['name-suffix']!, rng).text;
  const name = `${namePrefix}${nameCore}${nameSuffix}`.trim();

  // Industry sentence.
  const industryTemplate = pickWeighted(
    industry.templates.map((t) => ({ text: t.pattern, weight: 1 })),
    rng,
  ).text;
  const industryValues = resolvePlaceholders(
    industryTemplate,
    industry.slots,
    corpus.sharedSlots,
    rng,
  );
  const description = fillTemplate(industryTemplate, industryValues);

  // Job sentence.
  const jobTemplate = pickWeighted(
    job.jobDescriptionTemplates.map((t) => ({ text: t.pattern, weight: 1 })),
    rng,
  ).text;
  const jobValues = resolvePlaceholders(jobTemplate, job.jobSlots, corpus.sharedSlots, rng);
  const jobDescription = fillTemplate(jobTemplate, jobValues);

  const audience = pickWeighted(corpus.sharedSlots['audiences']!, rng).text;
  const deadline = pickWeighted(corpus.sharedSlots['deadlines']!, rng).text;

  return {
    seed,
    job: input.job,
    industry: input.industry,
    locale: input.locale,
    contentVersion,
    company: { name, description, audience },
    deliverable: { description: jobDescription, constraints: [], useCases: [] },
    deadline,
    generatedAt: new Date(0).toISOString(), // FIXED epoch â€” purity!
  };
}

function resolvePlaceholders(
  pattern: string,
  scoped: Record<string, ReturnType<typeof pickWeighted>[]> | Record<string, unknown>,
  shared: Record<string, ReturnType<typeof pickWeighted>[]> | Record<string, unknown>,
  rng: () => number,
): Record<string, string> {
  const out: Record<string, string> = {};
  const placeholders = [...pattern.matchAll(/\{\{(\w[\w-]*)\}\}/g)].map((m) => m[1]!);
  for (const key of placeholders) {
    const slot =
      (scoped as Record<string, ReturnType<typeof pickWeighted>[]>)[key] ??
      (shared as Record<string, ReturnType<typeof pickWeighted>[]>)[key];
    if (!slot) throw new Error(`generateBrief: slot "${key}" not found in industry/job/shared`);
    out[key] = pickWeighted(slot as { text: string; weight: number }[], rng).text;
  }
  return out;
}
```

Important: `generatedAt: new Date(0).toISOString()` is a **fixed epoch string** (`"1970-01-01T00:00:00.000Z"`) so the brief is byte-identical across machines. The HTTP layer (P3) will replace this with `Date.now()` _outside_ the pure function before storing in the log table.

- [ ] **Step 4: Re-export**

`packages/core/src/index.ts` becomes:

```ts
export { generateBrief, type GenerateInput } from './generate';
export { mulberry32 } from './prng';
export { generateSeed, seedToInt } from './seed';
```

Remove the `VERSION` placeholder from P0; update `packages/core/__tests__/smoke.test.ts` to import `generateBrief` instead.

- [ ] **Step 5: Verify + commit**

```
pnpm --filter @briefyard/core test
git add packages/core packages/core/package.json
git commit -m "feat(core): implement generateBrief() pure deterministic generator"
```

### Task 10 â€” Determinism regression + smoke-1000

**Files:**

- Create: `packages/core/__tests__/determinism.test.ts`
- Create: `packages/core/__tests__/smoke-1000.test.ts`

- [ ] **Step 1: Determinism test (100 iterations identical)**

```ts
import { describe, expect, it } from 'vitest';

import { generateBrief } from '../src/generate';

describe('determinism', () => {
  it('the same input produces a byte-identical Brief 100 times', () => {
    const reference = generateBrief({
      job: 'logo',
      industry: 'food',
      locale: 'en',
      seed: 'reg001',
    });
    const referenceJson = JSON.stringify(reference);
    for (let i = 0; i < 100; i++) {
      const again = generateBrief({
        job: 'logo',
        industry: 'food',
        locale: 'en',
        seed: 'reg001',
      });
      expect(JSON.stringify(again)).toBe(referenceJson);
    }
  });
});
```

- [ ] **Step 2: Smoke-1000 test**

Generate 1000 random briefs against the 1Ã—1 corpus and validate each against `Brief.parse`.

```ts
import { describe, expect, it } from 'vitest';

import { Brief } from '@briefyard/content';

import { generateBrief } from '../src/generate';
import { mulberry32 } from '../src/prng';
import { generateSeed } from '../src/seed';

describe('smoke-1000', () => {
  it('1000 random briefs all pass Brief.parse', () => {
    const failures: string[] = [];
    for (let i = 0; i < 1000; i++) {
      const seed = generateSeed();
      const brief = generateBrief({ job: 'logo', industry: 'food', locale: 'en', seed });
      const parsed = Brief.safeParse(brief);
      if (!parsed.success) {
        failures.push(`seed=${seed}: ${parsed.error.message}`);
      }
    }
    if (failures.length > 0) {
      throw new Error(
        `smoke-1000 had ${failures.length} failures:\n${failures.slice(0, 10).join('\n')}`,
      );
    }
    expect(failures).toEqual([]);
  });
});
```

- [ ] **Step 3: Verify + commit**

```
pnpm --filter @briefyard/core test
git add packages/core/__tests__/determinism.test.ts packages/core/__tests__/smoke-1000.test.ts
git commit -m "test(core): determinism regression (100 iterations) + smoke-1000"
```

### Task 11 â€” Coverage gate â‰¥ 95% lines on `@briefyard/core`

- [ ] **Step 1: Raise vitest coverage thresholds**

Edit `packages/core/vitest.config.ts`:

```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'lcov'],
  thresholds: {
    lines: 95,
    functions: 95,
    branches: 90,
    statements: 95,
  },
  include: ['src/**/*.ts'],
},
```

- [ ] **Step 2: Run coverage**

```
pnpm --filter @briefyard/core test --coverage
```

If coverage < threshold, the task is to add tests (not lower the bar). Likely uncovered branches: `pickWeighted` floating-point fallback line, `resolvePlaceholders` missing-slot throw. Add targeted unit tests.

- [ ] **Step 3: Commit**

```
git add packages/core/vitest.config.ts
git commit -m "test(core): enforce 95% line coverage threshold per ADR-004"
```

---

## Final integration & close-out

- [ ] **Run full pipeline**

```
pnpm verify
pnpm --filter @briefyard/web build
pnpm --filter @briefyard/web test:e2e
pnpm spec:check
```

All exit 0. CI on `main` green.

- [ ] **Update STATE.md**

```markdown
## Current phase

P3 â€” Discoverable Web (next)

## In progress

- Awaiting P3 plan authoring.

## Recent decisions

- 2026-MM-DD: P1 (Generator core) + P2-stub closed. Generator deterministic, 1Ã—1 EN corpus authored, smoke-1000 green, â‰¥ 95% line coverage on @briefyard/core.
```

(P3 next per the design's phase plan: SSG hub pages + SEO scaffolding + the rest of the corpus authoring happens in P4.)

- [ ] **Tag**

```
git tag -a p1-core -m "P1 â€” Generator core complete"
git push origin p1-core
```

---

## Known followups (not blocking P1 close)

- `forbidden-terms` test (deferred to P4 with full corpus).
- `parity` test (deferred to Phase 2 with PT corpus).
- Curated-seeds JSON (P3).
- The full 15 Ã— 20 corpus (P4).
- Complete CLAUDE-side review of every authored entry against `docs/content-style-guide.md` (do as part of P4 or sooner if a content-curator subagent finishes early).

---

**End of plan.** Approval gate: user reviews this file, requests changes if needed, then `superpowers:executing-plans` (or direct execution per current autonomy preference) starts Task 1.
