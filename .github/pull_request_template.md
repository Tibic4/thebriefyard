## What

<!-- One short paragraph. WHAT changes? -->

## Why

<!-- Link to the SPEC section, LD, ADR, or phase task this PR implements. -->

## Scope check

- [ ] Changes stay within the current phase (see `STATE.md`).
- [ ] No new dependency added (or: an ADR is included justifying it).
- [ ] No `any` introduced.
- [ ] No `Math.random()` in generator paths.
- [ ] If content slots changed: `CONTENT_VERSION` bumped.
- [ ] If a public contract changed: ADR added or amended.

## How to verify

<!-- Exact commands an engineer can run locally to confirm. -->

```
pnpm verify
```
