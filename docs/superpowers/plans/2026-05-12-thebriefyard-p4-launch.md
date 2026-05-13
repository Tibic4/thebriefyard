# thebriefyard P4 — Corpus Authoring + Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. P4 is the final implementation phase of v1 Phase 1 (SPEC §10.1). The goal is to satisfy the binary acceptance criteria — specifically the "≥ 6,000 static pages" gate — and ship the public launch.

**Goal:** Author the remaining (job × industry) corpus pairs in EN so the SSG build produces ≥ 6,000 indexable URLs, generate curated seeds (10 per hub) and route them as indexable permalinks, complete the launch checklist (Plausible + Vercel Analytics wired, Manu outreach sent, public launch posted on Hacker News + Product Hunt + designernews + Layers podcast outreach).

This plan **does NOT** cover PT-BR corpus, editorial long-form guides, expanded mode, regenerate-slot, history (IndexedDB), or sponsor slot. Those are Phase 2 of v1 (design doc §10.2) and get their own plan.

**Architecture:**

- **Corpus growth pattern.** Tasks 1–3 establish a "corpus author" workflow (a contributor-style PR template) and grow the EN corpus to **15 jobs × 20 industries = 300 pairs**. Each pair needs `industries/<id>.json` + `jobs/<id>.json` files; many slot files are shared across pairs (audiences, deadlines, emotions, name-grammar) so the marginal cost per pair shrinks.
- **Curated seeds.** Task 4 introduces `curated-seeds.json` — for each (job, industry), exactly 10 hand-picked seeds that produce high-quality briefs. The `generateStaticParams` of the permalink route reads this file and pre-renders those 3,000 permalinks. Curated permalinks are indexable; ad-hoc permalinks remain `noindex,follow` (P3 contract preserved).
- **Forbidden-terms gate.** Task 5 adds the `forbidden-terms` Zod-validated test (deferred from P1 plan). Required by ADR-010 once corpus volume justifies.
- **Launch wiring.** Tasks 6–8 wire Plausible + Vercel Analytics (LD-012), `randombrief.com` 301, public launch outreach.

**Tech stack additions:** none expected. `next/script` already available for analytics; the rest is content + config.

**Prerequisites:**

- P3 complete (tag `p3-web`). CI green including Lighthouse on 5 reference routes. ✅
- `STATE.md = "P4 — Corpus authoring + launch (next)"`. ✅
- Vercel production deploy operational at `thebriefyard-web.vercel.app`. ✅
- Phase 1 binary acceptance criteria (SPEC §10.1) — this plan satisfies them.

**Out of scope of P4:**

- PT-BR corpus authoring (→ Phase 2 of v1).
- Editorial guides (30 job-guides + 40 industry-guides) (→ Phase 2 of v1).
- Expanded mode (`?expanded=1`) (→ Phase 2 of v1).
- Regenerate-slot UI (→ Phase 2 of v1).
- Local history via IndexedDB (`/history`) (→ Phase 2 of v1).
- Sponsor-of-the-month slot UI (→ Phase 2 of v1).
- Lighthouse SEO threshold back to 1.00 (→ Phase 2 of v1 or polish plan; ADR-014 documents the 0.92 floor).
- PDF/PNG export implementation beyond the 501 stub (→ separate plan).

---

## Task index

| #   | Task                                                                                   | TDD focus     |
| --- | -------------------------------------------------------------------------------------- | ------------- |
| 1   | Corpus authoring workflow + contributor docs                                           | n/a (process) |
| 2   | Author shared slots to scale (≥ 50 entries each: audiences, deadlines, emotions, etc.) | content-lint  |
| 3   | Author remaining 14 jobs × 20 industries = 299 (job × industry) pairs in EN            | content-lint  |
| 4   | `curated-seeds.json` + indexable permalink routing                                     | e2e + smoke   |
| 5   | `forbidden-terms` content-lint                                                         | unit          |
| 6   | Plausible + Vercel Web Analytics wiring                                                | e2e           |
| 7   | `randombrief.com` 301 → `thebriefyard.com`                                             | manual (DNS)  |
| 8   | Launch checklist execution: Manu email, Product Hunt, HN, design communities           | manual        |
| 9   | Final binary-acceptance pass + tag `v1-phase1`                                         | n/a           |

---

## Task 1 — Corpus authoring workflow

**Files:**

- Modify: `docs/content-style-guide.md` (extend with PR template + slot-volume targets)
- Create: `.github/PULL_REQUEST_TEMPLATE/corpus.md`
- Create: `scripts/corpus-stats.ts` (prints per-locale entry counts per slot)

The corpus is the moat (SPEC §1, CAP-1). Authoring discipline matters.

- [ ] **Step 1: Extend `content-style-guide.md`** with:
  - Per-slot volume targets (e.g. cuisine ≥ 30, audiences ≥ 30, deadlines = 9, emotions ≥ 20).
  - Review rubric: each entry author-reviews 10 random combinations using `generateBrief` against their PR branch.
  - Forbidden-terms policy (full list lands in Task 5).

- [ ] **Step 2: PR template `corpus.md`** with the same checklist `pnpm content:lint`, smoke-1000 still green, did you spot-check 10 random combinations?

- [ ] **Step 3: `scripts/corpus-stats.ts`** — prints `locale × slot → entry count`. Useful to find under-populated slots before authoring industry files that reference them.

- [ ] **Step 4: Commit**

```
git add docs/content-style-guide.md .github/PULL_REQUEST_TEMPLATE scripts/corpus-stats.ts
git commit -m "docs(content): extend style guide + PR template + corpus-stats script for P4"
```

---

## Task 2 — Scale shared slots

The slots referenced by all industry/job templates (audiences, deadlines, emotions, name-grammar) must scale before we author 299 industry files — otherwise every brief draws from the same 12 audiences.

**Targets per shared slot (EN, end of P4):**

| Slot          | Current                | Target                   |
| ------------- | ---------------------- | ------------------------ |
| `name-prefix` | 10 (5 blank + 5 named) | 30 (15 blank + 15 named) |
| `name-core`   | 15                     | 80                       |
| `name-suffix` | 10 (5 blank + 5 named) | 30 (15 blank + 15 named) |
| `audiences`   | 12                     | 50                       |
| `deadlines`   | 9                      | 9 (already at canonical) |
| `emotions`    | 12                     | 40                       |

(After P4, the smoke-1000 test will sample a far broader space of company names and audiences — visible improvement.)

- [ ] **Step 1: Pause + invoke `content-curator` subagent** to author entries in batches of 10. After every batch, run `pnpm --filter @briefyard/content test` to confirm content-lints stay green.

- [ ] **Step 2: Commit per batch** with messages like `feat(content): add 10 audiences (size 12 → 22) for P4`.

- [ ] **Step 3: At each commit, run smoke-1000 in `@briefyard/core`** — output should remain valid; new entries should appear in the sample.

---

## Task 3 — Author the 299 remaining (job × industry) pairs

This is the bulk of P4. There are 15 jobs and 20 industries (SPEC §9.2). We already have `logo × food` from P2-stub. The remaining work is:

- **14 jobs to author** (industries are not required per pair — `industries/<id>.json` is reused across all 15 jobs). Industries: tech, food (existing), fashion, retail, entertainment, education, transportation, real-estate, travel, sports, healthcare, fintech, nonprofit, government, legal, agriculture, religion, gaming, beauty, automotive. **19 new industry files** needed.
- **15 jobs to author total**: logo (existing), brand-identity, website, packaging, billboard, illustration, mobile-app, icon-set, social-campaign, presentation, editorial, motion, type-design, merch, wayfinding. **14 new job files** needed.

**Files per industry** (~250 word blurb + 4 industry-scoped slots with 8-10 entries each + 1 template + seo title/description). Estimated 80–120 lines of JSON per file.

**Files per job** (~250 word blurb + 3 job-scoped slots with 6-9 entries each + 1 template + seo). Estimated 60–100 lines of JSON.

Output: 19 industry files + 14 job files = **33 new authored files**.

- [ ] **Step 1: Author one job × one industry per PR (incremental).** Order recommended (in priority of search volume / portfolio relevance):
  1. `brand-identity` (most common practice exercise; pairs with all 20 industries)
  2. `website` (next most common)
  3. `packaging × food, fashion, retail, beauty` (already have food template — extend)
  4. `social-campaign` (broad relevance)
  5. `mobile-app × tech, fintech, food, retail` (commercial focus)
  6. `illustration × entertainment, education, gaming, nonprofit`
  7. ... (continue per the matrix)

- [ ] **Step 2: After each file lands**, build the site locally:

```
pnpm --filter @briefyard/web build
```

The SSG output should reflect the new hub pairs (e.g. `/en/brief/logo/tech` becomes a static page).

- [ ] **Step 3: Re-run smoke-1000 in `@briefyard/core`** — every brief must still pass `Brief.parse`.

- [ ] **Step 4: At the end of Task 3**, the sitemap should list:
  - 4 statics (`/`, `/about`, `/faq`, `/newsletter`) × 2 locales = 8 URLs (PT placeholders are intentionally indexable; they'll get real content in Phase 2 of v1)
  - 300 hubs × 2 locales = 600 hub URLs
  - **Total: ~608 hub-level URLs.** Curated permalinks (Task 4) take this to ~6,608.

---

## Task 4 — Curated seeds + indexable permalinks

This is what gets us to ≥ 6,000 indexable URLs (Phase 1 SPEC §10.1 binary acceptance).

**Files:**

- Create: `packages/content/curated-seeds.json`
- Create: `packages/content/src/curated.ts` (loader for curated seeds with validation)
- Modify: `apps/web/app/[locale]/brief/[job]/[industry]/[seed]/page.tsx` (mark curated as indexable)
- Modify: `apps/web/app/sitemap.ts` (include curated permalinks)
- Create: `packages/content/__tests__/curated-seeds.test.ts`

`curated-seeds.json` format:

```json
{
  "logo": {
    "food": ["a7f3c2", "k9p2m1", "..."],
    "tech": ["..."]
  },
  "brand-identity": {
    "food": ["..."]
  }
}
```

Per (job, industry): exactly 10 seeds. 300 pairs × 10 = 3,000 seeds × 2 locales = **6,000 curated permalink URLs**. With 8 statics + 600 hubs = **6,608 indexable URLs total**.

- [ ] **Step 1: Schema + loader.**

```ts
export const CuratedSeedsSchema = z.record(JobId, z.record(IndustryId, z.array(Seed).length(10)));
```

- [ ] **Step 2: Curated seeds authoring discipline.**

The founder hand-picks each seed by running `generateBrief` repeatedly until 10 "good" briefs emerge per pair. Good = company name reads naturally, prose is coherent, deadline + use-case combination makes sense. Roughly 30-60 min per pair × 300 = 150-300 hours total. **This is the most time-consuming task in v1.**

Mitigation: write a `scripts/curate-helper.ts` that generates N candidates and lets you mark 10 keepers in a terminal UI. Curated-seeds.json is the output.

- [ ] **Step 3: Update the permalink page (`[seed]/page.tsx`):**

If `seed` is in `curated-seeds.json[job][industry]`, emit indexable metadata (drop `noindex`); else keep `noindex,follow`. Update `generateStaticParams` of the permalink route to enumerate curated seeds (these become SSG, not ISR).

- [ ] **Step 4: Sitemap.**

Add curated permalink URLs to the sitemap output. Partition the sitemap at > 5,000 URLs per `docs/seo-playbook.md` — emit `/sitemap-1.xml`, `/sitemap-2.xml`, `/sitemap-index.xml`.

- [ ] **Step 5: e2e + smoke.**

```ts
test('curated permalink is indexable (no noindex)', async ({ page }) => {
  // pick a known curated seed from curated-seeds.json fixture
  await page.goto('/brief/logo/food/<curated seed>');
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/);
});

test('ad-hoc seed remains noindex', async ({ page }) => {
  await page.goto('/brief/logo/food/zzzzzz'); // not in curated
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
```

- [ ] **Step 6: Build acceptance.**

```
pnpm --filter @briefyard/web build
```

Expected output: `Generating static pages (≥ 6,000/...)`.

- [ ] **Step 7: Commit per industry-batch.** Don't ship all 6,000 in one PR.

---

## Task 5 — `forbidden-terms` content-lint

Deferred from P1 with a stub. Now activate.

**Files:**

- Create: `packages/content/__tests__/forbidden-terms.test.ts`
- Create: `packages/content/src/forbidden-terms.ts` (list, exported so contributors can read it)

- [ ] **Step 1: Author the forbidden-terms list** in `forbidden-terms.ts`. Categories: slurs (canonical EN + PT lists from authoritative sources), trademarked brand names that we explicitly do NOT want to encourage as practice (e.g. Coca-Cola, Apple — practice briefs against real brands invite legal issues), specific real people. Keep the list short and defensible.

- [ ] **Step 2: Test.**

```ts
test('no slot entry contains a forbidden term', () => {
  const corpus = readCorpus('en');
  // walk every entry text; case-insensitive substring match against forbidden list
});
```

- [ ] **Step 3: If any current entry violates, fix or remove.**

- [ ] **Step 4: Commit.**

---

## Task 6 — Plausible + Vercel Web Analytics

LD-012 (zero invasive tracking). Both are cookieless.

- [ ] **Step 1: Vercel Web Analytics.** Add `@vercel/analytics` and `<Analytics />` to `[locale]/layout.tsx`.

- [ ] **Step 2: Plausible.** Add the standard `<script defer data-domain="thebriefyard.com" src="https://plausible.io/js/script.tagged-events.js" />` (matches Goodbrief's approach). No data-domain conflict.

- [ ] **Step 3: e2e: confirm both scripts present.**

```ts
test('home loads with Plausible + Vercel analytics scripts', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('script[src*="plausible.io"]')).toBeAttached();
  await expect(page.locator('script[src*="/_vercel/insights"]')).toBeAttached();
});
```

- [ ] **Step 4: Verify no GA, no GTM, no Meta Pixel.** Lint rule or test: any script src matching `googletagmanager|google-analytics|facebook|fbevents` fails.

- [ ] **Step 5: Commit.**

---

## Task 7 — `randombrief.com` 301

External + DNS work. Outside repo, but tracked here.

- [ ] **Step 1: Purchase `randombrief.com` if not already.**

- [ ] **Step 2: DNS A record → Vercel.** Add `randombrief.com` as a domain alias on the Vercel project, configured as **redirect to `thebriefyard.com`** (Vercel "Redirect" option, code 301).

- [ ] **Step 3: Verify with `curl -I https://randombrief.com`** — expect `301 → https://thebriefyard.com/`.

- [ ] **Step 4: Record the decision in `STATE.md`.**

---

## Task 8 — Launch checklist

Once Tasks 1–7 close and CI is green, ship the public launch.

- [ ] **Step 1: Send `docs/outreach-manu.md` to Manu via email** before public posts. Adapt the draft with the live URL and your name. Wait 48h before posting public — if Manu objects to anything, address it first.

- [ ] **Step 2: Product Hunt scheduling.** Schedule a Tuesday or Wednesday launch (best PH days). Title: "thebriefyard — Practice design briefs. Free. Human-curated. No AI."

- [ ] **Step 3: Hacker News Show HN post.** Single sentence: "I built a free combinatorial design-brief generator. No AI. The seed in the URL makes briefs shareable forever."

- [ ] **Step 4: designernews + Reddit r/Design + r/web_design + Layers podcast outreach.** Tone: indie, no hard sell.

- [ ] **Step 5: Newsletter announcement** via Buttondown (the embed already lives at `/newsletter`).

- [ ] **Step 6: Watch Search Console.** Submit the sitemap. First indexing wave should land within 72h.

---

## Task 9 — Binary acceptance + tag `v1-phase1`

Walk through SPEC §10.1 binary acceptance criteria.

- [ ] [ ] `pnpm install && pnpm test` passes on fresh clone.
- [ ] [ ] `pnpm build` produces ≥ 6,000 static pages.
- [ ] [ ] Lighthouse mobile: Perf ≥ 90, SEO ≥ 92 (interim per ADR-014), A11y ≥ 95, BP ≥ 95.
- [ ] [ ] Generator byte-identical across 100 invocations (regression script).
- [ ] [ ] 1,000 smoke briefs pass `Brief.parse`.
- [ ] [ ] Permalink + private window → same brief renders server-side.
- [ ] [ ] PDF/PNG export — stubbed in P3, full implementation deferred to a separate plan; mark as "not blocking Phase 1 close" with a tracking issue.
- [ ] [ ] OG image p95 < 500 ms (Edge cache hit). Verify with `ab` or DevTools after first warm.
- [ ] [ ] Sitemap lists 6,000+ URLs.
- [ ] [ ] Ad-hoc permalinks `noindex`; curated permalinks indexable.
- [ ] [ ] Coverage: core ≥ 95% (already ✅), web routes ≥ 70% (audit after P4).
- [ ] [ ] `main` CI green 5 consecutive commits + 14 consecutive days.

Once all green:

```
git tag -a v1-phase1 -m "v1 Phase 1 (Generator + 600 hubs) complete"
git push origin v1-phase1
```

Update `STATE.md`:

```markdown
## Current phase

v1 Phase 2 — PT-BR + guides + retention UX (next, see ROADMAP)
```

---

## Known followups (Phase 2 of v1 territory)

- PT-BR slot corpus, full 15×20 authoring.
- 30 + 40 editorial guides (1,500–2,500 words each, Hemingway ≤ grade 9).
- Expanded-mode toggle (V7).
- Regenerate-slot interaction.
- Local history via IndexedDB at `/history`.
- Sponsor-of-the-month UI in footer + per guide.
- Formal external a11y audit.
- Lighthouse SEO threshold to 1.00 (run LHCI against Vercel preview deploy, not local).

---

**End of plan.** Approval gate: user reviews this file, requests changes if needed, then `superpowers:executing-plans` (or direct autonomous execution per current preference) starts Task 1.
