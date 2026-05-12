# thebriefyard P0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up an empty-but-correct monorepo for thebriefyard: pnpm + Turborepo workspaces, five canonical governance docs (LANDSCAPE, ROADMAP, SPEC, CLAUDE, STATE), thirteen ADRs, `.claude/` agent infrastructure (subagents, slash commands, hooks), CI pipeline green on empty packages, deployable Next.js shell on Vercel preview.

**Architecture:** Monorepo with pnpm workspaces and Turborepo for orchestration. Three packages (`@briefyard/core`, `@briefyard/content`, `@briefyard/types`) and one app (`apps/web`) initialized as empty-but-buildable stubs. Governance docs live at repo root. ADRs in `docs/adrs/`. Subagents and slash commands in `.claude/`. GitHub Actions runs lint + typecheck + test + build on every PR.

**Tech Stack:** Node 20 LTS, pnpm 9, Turborepo 2, TypeScript 5.4 strict, Vitest 2, Next.js 14, ESLint 9, Prettier 3, Husky + lint-staged, GitHub Actions.

**Prerequisites:**

- `D:\thebriefyard\docs\superpowers\specs\2026-05-12-thebriefyard-design.md` exists and is the source of truth.
- Local Node 20+, pnpm 9+, git installed and on PATH.
- GitHub account with permission to create a public repo named `thebriefyard`.
- Vercel account.
- Domain `thebriefyard.com` purchased (out of scope of this plan — verify in Task 1 step 1).

**Out of scope of P0:** any product code (generator logic, content corpus beyond skeleton fixture, SSG routes beyond `/` stub, OG/PDF/PNG endpoints, SEO scaffolding, deploy to production domain). Those live in P1–P4.

---

## File map

Files created in this plan:

```
thebriefyard/
├── .gitignore
├── .nvmrc
├── .npmrc
├── .editorconfig
├── .prettierrc.json
├── .prettierignore
├── .eslintrc.cjs                          # root ESLint config (flat config alt: eslint.config.js)
├── tsconfig.base.json
├── package.json                            # root, private, workspace manifest
├── pnpm-workspace.yaml
├── turbo.json
├── README.md
├── LICENSE                                 # MIT for code
├── LICENSE-content                         # CC BY-SA 4.0 reference for corpus
├── CLAUDE.md                               # 200-line max, agent rules
├── STATE.md                                # current phase, blockers
├── LANDSCAPE.md                            # capabilities, segments, LDs
├── ROADMAP.md                              # versions, triggers, thresholds
├── SPEC.md                                 # arch, data model, ADRs, phases
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   └── pull_request_template.md
├── .husky/
│   └── pre-commit
├── .claude/
│   ├── settings.json
│   ├── agents/
│   │   ├── generator-engineer.md
│   │   ├── content-curator.md
│   │   ├── seo-engineer.md
│   │   ├── frontend-engineer.md
│   │   └── architect-reviewer.md
│   ├── commands/
│   │   ├── adr-new.md
│   │   ├── phase-status.md
│   │   ├── verify.md
│   │   ├── content-lint.md
│   │   └── seo-audit.md
│   └── hooks/
│       ├── pre-commit-tests.sh
│       └── pre-pr-spec-check.sh
├── docs/
│   ├── adrs/
│   │   ├── README.md
│   │   ├── ADR-001-nextjs-app-router-typescript.md
│   │   ├── ADR-002-postgres-single-store.md
│   │   ├── ADR-003-slot-corpus-json-in-git.md
│   │   ├── ADR-004-pure-deterministic-generator.md
│   │   ├── ADR-005-pdf-react-pdf-og-satori.md
│   │   ├── ADR-006-better-auth-self-hosted.md
│   │   ├── ADR-007-next-intl-localized-routes.md
│   │   ├── ADR-008-code-mit-content-ccbysa.md
│   │   ├── ADR-009-no-orm-postgres-js.md
│   │   ├── ADR-010-zod-schema-validates-content-in-ci.md
│   │   ├── ADR-011-cookie-and-privacy-policy.md
│   │   ├── ADR-012-public-api-rate-limit-policy.md
│   │   └── ADR-013-husky-precommit-quality-gate.md
│   ├── content-style-guide.md
│   ├── seo-playbook.md
│   ├── sponsor-policy.md
│   └── outreach-manu.md                    # cordial email draft
├── packages/
│   ├── eslint-config/
│   │   ├── package.json
│   │   ├── index.cjs
│   │   └── README.md
│   ├── types/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/index.ts
│   │   └── __tests__/smoke.test.ts
│   ├── core/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── src/index.ts
│   │   └── __tests__/smoke.test.ts
│   └── content/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── src/index.ts
│       ├── version.ts
│       └── __tests__/smoke.test.ts
├── apps/
│   └── web/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.mjs
│       ├── next-env.d.ts
│       ├── postcss.config.mjs
│       ├── tailwind.config.ts
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── public/
│       │   └── robots.txt
│       └── e2e/
│           └── smoke.spec.ts
└── scripts/
    ├── verify-phase.ts
    └── new-adr.ts
```

---

## Task 1 — Prerequisites and repo init

**Files:**

- Create: working directory `D:\thebriefyard\` already initialised; we work inside it.
- Create: `D:\thebriefyard\.gitignore`
- Create: `D:\thebriefyard\.nvmrc`
- Create: `D:\thebriefyard\.npmrc`
- Create: `D:\thebriefyard\.editorconfig`

- [ ] **Step 1: Verify local tooling**

Run:

```
node -v
pnpm -v
git --version
```

Expected:

- `node -v` ≥ `v20.0.0`
- `pnpm -v` ≥ `9.0.0` (if not installed: `corepack enable && corepack prepare pnpm@9.12.0 --activate`)
- `git --version` ≥ `2.30`

If any version is below threshold, STOP. Install/upgrade before continuing.

- [ ] **Step 2: Initialise git repo**

Run:

```
cd D:\thebriefyard
git init -b main
git config core.autocrlf input
```

Expected: `Initialized empty Git repository in D:/thebriefyard/.git/`. (If repo already initialised, this is a no-op; that is fine.)

- [ ] **Step 3: Write `.gitignore`**

Create `D:\thebriefyard\.gitignore`:

```gitignore
# deps
node_modules/
.pnpm-store/

# build
dist/
.next/
out/
build/
.turbo/
coverage/

# env
.env
.env.local
.env.*.local

# generated content (compiled corpus)
packages/content/compiled/

# OS
.DS_Store
Thumbs.db
desktop.ini

# editor
.vscode/
.idea/
*.swp
*.swo

# logs
*.log
npm-debug.log*
pnpm-debug.log*

# Vercel
.vercel/

# test artifacts
.vitest-cache/
playwright-report/
test-results/

# misc local
recon/                           # local recon notes (D:\thebriefyard\recon already exists)
```

- [ ] **Step 4: Write `.nvmrc`**

Create `D:\thebriefyard\.nvmrc`:

```
20.18.0
```

- [ ] **Step 5: Write `.npmrc`**

Create `D:\thebriefyard\.npmrc`:

```ini
auto-install-peers=true
strict-peer-dependencies=false
prefer-workspace-packages=true
shamefully-hoist=false
engine-strict=true
```

- [ ] **Step 6: Write `.editorconfig`**

Create `D:\thebriefyard\.editorconfig`:

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

- [ ] **Step 7: Commit**

Run:

```
git add .gitignore .nvmrc .npmrc .editorconfig
git commit -m "chore: initialise repo with editor and ignore config"
```

Expected: 4 files committed.

---

## Task 2 — Root manifest, workspace, Turborepo

**Files:**

- Create: `D:\thebriefyard\package.json`
- Create: `D:\thebriefyard\pnpm-workspace.yaml`
- Create: `D:\thebriefyard\turbo.json`
- Create: `D:\thebriefyard\tsconfig.base.json`

- [ ] **Step 1: Write root `package.json`**

Create `D:\thebriefyard\package.json`:

```json
{
  "name": "thebriefyard",
  "private": true,
  "version": "0.0.0",
  "description": "thebriefyard — practice engine for designers. Human-curated combinatorial brief generator.",
  "license": "MIT",
  "engines": {
    "node": ">=20.18.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.12.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "test:watch": "turbo run test:watch --parallel",
    "test:e2e": "turbo run test:e2e",
    "typecheck": "turbo run typecheck",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "verify": "pnpm run lint && pnpm run typecheck && pnpm run test",
    "spec:check": "tsx scripts/verify-phase.ts",
    "adr:new": "tsx scripts/new-adr.ts",
    "prepare": "husky"
  },
  "devDependencies": {
    "@types/node": "^20.12.7",
    "husky": "^9.1.6",
    "lint-staged": "^15.2.10",
    "prettier": "^3.3.3",
    "tsx": "^4.19.1",
    "turbo": "^2.1.3",
    "typescript": "^5.4.5"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,mjs,cjs}": ["prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

- [ ] **Step 2: Write `pnpm-workspace.yaml`**

Create `D:\thebriefyard\pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

- [ ] **Step 3: Write `turbo.json`**

Create `D:\thebriefyard\turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env", "tsconfig.base.json"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "test:e2e": {
      "dependsOn": ["^build"],
      "outputs": ["playwright-report/**", "test-results/**"]
    }
  }
}
```

- [ ] **Step 4: Write `tsconfig.base.json`**

Create `D:\thebriefyard\tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false
  },
  "exclude": ["node_modules", "dist", ".next", "coverage"]
}
```

- [ ] **Step 5: Install dependencies**

Run:

```
pnpm install
```

Expected: lockfile created, `node_modules/` populated. No build errors. (`packages/*` and `apps/*` don't exist yet — pnpm will warn but proceed.)

- [ ] **Step 6: Verify Turbo CLI works**

Run:

```
pnpm exec turbo --version
```

Expected: prints `2.1.x` or higher.

- [ ] **Step 7: Commit**

Run:

```
git add package.json pnpm-workspace.yaml turbo.json tsconfig.base.json pnpm-lock.yaml
git commit -m "chore: add root manifest, pnpm workspace, turborepo, base tsconfig"
```

Expected: 5 files committed.

---

## Task 3 — Prettier and ESLint root config

**Files:**

- Create: `D:\thebriefyard\.prettierrc.json`
- Create: `D:\thebriefyard\.prettierignore`
- Create: `D:\thebriefyard\packages\eslint-config\package.json`
- Create: `D:\thebriefyard\packages\eslint-config\index.cjs`
- Create: `D:\thebriefyard\packages\eslint-config\README.md`
- Create: `D:\thebriefyard\.eslintrc.cjs`

- [ ] **Step 1: Write `.prettierrc.json`**

Create `D:\thebriefyard\.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- [ ] **Step 2: Write `.prettierignore`**

Create `D:\thebriefyard\.prettierignore`:

```
node_modules
dist
.next
.turbo
coverage
pnpm-lock.yaml
packages/content/compiled
recon
```

- [ ] **Step 3: Create `packages/eslint-config` directory and `package.json`**

Create `D:\thebriefyard\packages\eslint-config\package.json`:

```json
{
  "name": "@briefyard/eslint-config",
  "version": "0.0.0",
  "private": true,
  "main": "index.cjs",
  "files": ["index.cjs"],
  "peerDependencies": {
    "eslint": "^8.57.0"
  },
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-unused-imports": "^4.1.4"
  }
}
```

- [ ] **Step 4: Write `packages/eslint-config/index.cjs`**

Create `D:\thebriefyard\packages\eslint-config\index.cjs`:

```js
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: false,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      typescript: { alwaysTryTypes: true },
      node: true,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: [
    'dist',
    '.next',
    '.turbo',
    'node_modules',
    'coverage',
    'packages/content/compiled',
  ],
};
```

- [ ] **Step 5: Write `packages/eslint-config/README.md`**

Create `D:\thebriefyard\packages\eslint-config\README.md`:

````markdown
# @briefyard/eslint-config

Shared ESLint config for the thebriefyard monorepo. Extends `eslint:recommended`,
`@typescript-eslint/recommended`, `import`, and `prettier`. Bans `any`, enforces import
order, removes unused imports.

## Usage

In any package or app `.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  extends: ['@briefyard/eslint-config'],
};
```
````

````

- [ ] **Step 6: Write root `.eslintrc.cjs`**

Create `D:\thebriefyard\.eslintrc.cjs`:
```js
module.exports = {
  root: true,
  extends: ['@briefyard/eslint-config'],
  ignorePatterns: ['scripts/**', '*.config.*', '*.cjs', '*.mjs'],
};
````

- [ ] **Step 7: Install ESLint and Prettier deps at the root**

Run:

```
pnpm add -Dw eslint@^8.57.0 @briefyard/eslint-config@workspace:*
```

Expected: lockfile updated, root `package.json` shows the two dev deps.

- [ ] **Step 8: Verify lint runs (will pass — nothing to lint yet)**

Run:

```
pnpm exec eslint . --ext .ts,.tsx,.js,.cjs,.mjs --max-warnings=0
```

Expected: exits with code 0 and no output (only `.cjs` config files exist; they are ignored by ignorePatterns or by extension match).

- [ ] **Step 9: Commit**

Run:

```
git add .prettierrc.json .prettierignore .eslintrc.cjs packages/eslint-config package.json pnpm-lock.yaml
git commit -m "chore: add prettier root config and @briefyard/eslint-config package"
```

Expected: clean commit.

---

## Task 4 — Husky pre-commit hook

**Files:**

- Create: `D:\thebriefyard\.husky\pre-commit`

- [ ] **Step 1: Initialise Husky**

Run:

```
pnpm exec husky init
```

Expected: creates `.husky/pre-commit` with a placeholder `npm test` line, and modifies `package.json` (which already has `"prepare": "husky"`).

- [ ] **Step 2: Overwrite `.husky/pre-commit` with the real hook**

Replace contents of `D:\thebriefyard\.husky\pre-commit`:

```sh
#!/usr/bin/env sh

# Run lint-staged for formatting on staged files
pnpm exec lint-staged

# Run typecheck and tests against changed packages only (cheap with turbo cache)
pnpm exec turbo run typecheck test --filter='[HEAD^]' --cache-dir=.turbo
```

Make it executable (Windows: not strictly needed for git; Linux/Mac):

```
git update-index --chmod=+x .husky/pre-commit
```

- [ ] **Step 3: Test the pre-commit hook fires**

Run:

```
git add .husky/pre-commit
git commit -m "chore: configure husky pre-commit hook"
```

Expected: hook executes (`lint-staged` runs against staged files, turbo runs against `HEAD^` changes). Commit succeeds. If on a brand-new repo where `HEAD^` doesn't exist, turbo will warn but exit 0 — that is OK.

---

## Task 5 — `@briefyard/types` package skeleton

**Files:**

- Create: `D:\thebriefyard\packages\types\package.json`
- Create: `D:\thebriefyard\packages\types\tsconfig.json`
- Create: `D:\thebriefyard\packages\types\src\index.ts`
- Create: `D:\thebriefyard\packages\types\__tests__\smoke.test.ts`
- Create: `D:\thebriefyard\packages\types\vitest.config.ts`
- Create: `D:\thebriefyard\packages\types\.eslintrc.cjs`

- [ ] **Step 1: Write `package.json`**

Create `D:\thebriefyard\packages\types\package.json`:

```json
{
  "name": "@briefyard/types",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json --emitDeclarationOnly",
    "lint": "eslint . --ext .ts --max-warnings=0",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@briefyard/eslint-config": "workspace:*",
    "@types/node": "^20.12.7",
    "eslint": "^8.57.0",
    "typescript": "^5.4.5",
    "vitest": "^2.1.2"
  },
  "dependencies": {
    "zod": "^3.23.8"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

Create `D:\thebriefyard\packages\types\tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src", "__tests__"]
}
```

- [ ] **Step 3: Write `src/index.ts` with the locked literal enums from SPEC §9.2**

Create `D:\thebriefyard\packages\types\src\index.ts`:

```ts
import { z } from 'zod';

/**
 * Canonical literal IDs for jobs and industries. Source of truth: SPEC §9.2.
 * Changing this list requires a content-version bump and an ADR amendment.
 */

export const JobId = z.enum([
  'logo',
  'brand-identity',
  'website',
  'packaging',
  'billboard',
  'illustration',
  'mobile-app',
  'icon-set',
  'social-campaign',
  'presentation',
  'editorial',
  'motion',
  'type-design',
  'merch',
  'wayfinding',
]);
export type JobId = z.infer<typeof JobId>;

export const IndustryId = z.enum([
  'tech',
  'food',
  'fashion',
  'retail',
  'entertainment',
  'education',
  'transportation',
  'real-estate',
  'travel',
  'sports',
  'healthcare',
  'fintech',
  'nonprofit',
  'government',
  'legal',
  'agriculture',
  'religion',
  'gaming',
  'beauty',
  'automotive',
]);
export type IndustryId = z.infer<typeof IndustryId>;

export const LocaleId = z.enum(['en', 'pt']);
export type LocaleId = z.infer<typeof LocaleId>;

/**
 * 6 character base36 seed. Regex enforced.
 */
export const Seed = z.string().regex(/^[0-9a-z]{6}$/);
export type Seed = z.infer<typeof Seed>;

/**
 * Constants for downstream consumers — derived from the Zod enums so any drift fails
 * typecheck.
 */
export const JOB_IDS = JobId.options;
export const INDUSTRY_IDS = IndustryId.options;
export const LOCALE_IDS = LocaleId.options;
```

- [ ] **Step 4: Write `vitest.config.ts`**

Create `D:\thebriefyard\packages\types\vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
```

- [ ] **Step 5: Write the smoke test**

This is a smoke test, not a red→green TDD cycle. The types are already defined in
Step 3, so the test passes on first run. Real TDD discipline kicks in for
`@briefyard/core` (P1). The job of this test is to lock the canonical counts
(15 jobs, 20 industries, 2 locales) at the type-package level.

Create `D:\thebriefyard\packages\types\__tests__\smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { INDUSTRY_IDS, JOB_IDS, LOCALE_IDS, Seed } from '../src/index.js';

describe('types package', () => {
  it('exports exactly 15 job ids matching SPEC §9.2', () => {
    expect(JOB_IDS).toHaveLength(15);
    expect(JOB_IDS).toContain('logo');
    expect(JOB_IDS).toContain('wayfinding');
  });

  it('exports exactly 20 industry ids matching SPEC §9.2', () => {
    expect(INDUSTRY_IDS).toHaveLength(20);
    expect(INDUSTRY_IDS).toContain('tech');
    expect(INDUSTRY_IDS).toContain('automotive');
  });

  it('exports exactly 2 locales matching LD-004', () => {
    expect(LOCALE_IDS).toEqual(['en', 'pt']);
  });

  it('Seed accepts 6-char base36 strings', () => {
    expect(Seed.safeParse('a7f3c2').success).toBe(true);
    expect(Seed.safeParse('000000').success).toBe(true);
  });

  it('Seed rejects malformed strings', () => {
    expect(Seed.safeParse('a7f3c').success).toBe(false);
    expect(Seed.safeParse('a7f3c2g').success).toBe(false);
    expect(Seed.safeParse('A7F3C2').success).toBe(false); // upper-case not allowed
    expect(Seed.safeParse('').success).toBe(false);
  });
});
```

- [ ] **Step 6: Write `.eslintrc.cjs`**

Create `D:\thebriefyard\packages\types\.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  extends: ['@briefyard/eslint-config'],
};
```

- [ ] **Step 7: Install deps**

Run:

```
pnpm install
```

Expected: workspace recognises `@briefyard/types`, vitest and zod installed.

- [ ] **Step 8: Run the test — expect PASS (this is a smoke test, not a red→green TDD cycle)**

Run:

```
pnpm --filter @briefyard/types test
```

Expected: 5 tests passed.

- [ ] **Step 9: Typecheck**

Run:

```
pnpm --filter @briefyard/types typecheck
```

Expected: no output, exit 0.

- [ ] **Step 10: Commit**

Run:

```
git add packages/types pnpm-lock.yaml
git commit -m "feat(types): scaffold @briefyard/types with canonical job/industry/locale enums"
```

Expected: clean commit, husky hook passes.

---

## Task 6 — `@briefyard/core` and `@briefyard/content` empty package skeletons

These are full TDD targets in P1 and P2. Here we only create the empty-but-buildable scaffolds so the workspace resolves.

**Files:**

- Create: `packages/core/{package.json, tsconfig.json, vitest.config.ts, src/index.ts, __tests__/smoke.test.ts, .eslintrc.cjs}`
- Create: `packages/content/{package.json, tsconfig.json, vitest.config.ts, src/index.ts, version.ts, __tests__/smoke.test.ts, .eslintrc.cjs}`

- [ ] **Step 1: Write `packages/core/package.json`**

Create `D:\thebriefyard\packages\core\package.json`:

```json
{
  "name": "@briefyard/core",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json --emitDeclarationOnly",
    "lint": "eslint . --ext .ts --max-warnings=0",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@briefyard/eslint-config": "workspace:*",
    "@types/node": "^20.12.7",
    "eslint": "^8.57.0",
    "typescript": "^5.4.5",
    "vitest": "^2.1.2"
  },
  "dependencies": {
    "@briefyard/types": "workspace:*",
    "zod": "^3.23.8"
  }
}
```

- [ ] **Step 2: Write `packages/core/tsconfig.json`**

Create `D:\thebriefyard\packages\core\tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src", "__tests__"]
}
```

- [ ] **Step 3: Write `packages/core/vitest.config.ts`**

Create `D:\thebriefyard\packages\core\vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 0, // P1 will raise this to 95
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
});
```

- [ ] **Step 4: Write `packages/core/src/index.ts` placeholder**

Create `D:\thebriefyard\packages\core\src\index.ts`:

```ts
/**
 * @briefyard/core — pure deterministic brief generator.
 *
 * P0 ships an empty scaffold so the workspace resolves. P1 implements:
 *   - PRNG (mulberry32)
 *   - seed encoding/decoding (base36 6 chars)
 *   - slot picker (weighted)
 *   - template filler
 *   - generateBrief()
 *
 * Until P1 lands, importing from this package returns the package version only.
 */

export const VERSION = '0.0.0';
```

- [ ] **Step 5: Write `packages/core/__tests__/smoke.test.ts`**

Create `D:\thebriefyard\packages\core\__tests__\smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { VERSION } from '../src/index.js';

describe('@briefyard/core smoke', () => {
  it('exposes VERSION constant (P0 placeholder)', () => {
    expect(VERSION).toBe('0.0.0');
  });
});
```

- [ ] **Step 6: Write `packages/core/.eslintrc.cjs`**

Create `D:\thebriefyard\packages\core\.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  extends: ['@briefyard/eslint-config'],
};
```

- [ ] **Step 7: Write `packages/content/package.json`**

Create `D:\thebriefyard\packages\content\package.json`:

```json
{
  "name": "@briefyard/content",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./version": "./version.ts"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json --emitDeclarationOnly",
    "lint": "eslint . --ext .ts --max-warnings=0",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@briefyard/eslint-config": "workspace:*",
    "@types/node": "^20.12.7",
    "eslint": "^8.57.0",
    "typescript": "^5.4.5",
    "vitest": "^2.1.2"
  },
  "dependencies": {
    "@briefyard/types": "workspace:*",
    "zod": "^3.23.8"
  }
}
```

- [ ] **Step 8: Write `packages/content/tsconfig.json`**

Create `D:\thebriefyard\packages\content\tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["src", "version.ts", "__tests__"]
}
```

- [ ] **Step 9: Write `packages/content/vitest.config.ts`**

Create `D:\thebriefyard\packages\content\vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
  },
});
```

- [ ] **Step 10: Write `packages/content/version.ts`**

Create `D:\thebriefyard\packages\content\version.ts`:

```ts
/**
 * Monotonic content version. Bump on ANY PR that changes slot semantics:
 *   - add entry
 *   - remove entry
 *   - rename slot
 *   - change weight
 *   - change template pattern
 *
 * Old permalinks resolve against the matching `compiled/content.<v>.json`.
 * See SPEC §9.4.
 */
export const CONTENT_VERSION = 1 as const;
```

- [ ] **Step 11: Write `packages/content/src/index.ts` placeholder**

Create `D:\thebriefyard\packages\content\src\index.ts`:

```ts
/**
 * @briefyard/content — JSON-versioned slot corpus + Zod schema + loader.
 *
 * P0 ships an empty scaffold. P2 implements:
 *   - Zod schemas (SlotEntry, IndustryFile, JobFile, Brief)
 *   - locales/{en,pt}/** corpus files
 *   - loader.ts that compiles locales/* into compiled/content.<v>.json
 *   - content-lint test suite (schema-valid, parity, no-duplicates, forbidden-terms,
 *     length-bounds, smoke-1000)
 */

export { CONTENT_VERSION } from '../version.js';
```

- [ ] **Step 12: Write `packages/content/__tests__/smoke.test.ts`**

Create `D:\thebriefyard\packages\content\__tests__\smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { CONTENT_VERSION } from '../src/index.js';

describe('@briefyard/content smoke', () => {
  it('exposes CONTENT_VERSION starting at 1 (P0 placeholder)', () => {
    expect(CONTENT_VERSION).toBe(1);
  });
});
```

- [ ] **Step 13: Write `packages/content/.eslintrc.cjs`**

Create `D:\thebriefyard\packages\content\.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  extends: ['@briefyard/eslint-config'],
};
```

- [ ] **Step 14: Install and verify both packages**

Run:

```
pnpm install
pnpm --filter @briefyard/core test
pnpm --filter @briefyard/content test
```

Expected: each suite reports 1 passing test.

- [ ] **Step 15: Verify lint and typecheck**

Run:

```
pnpm --filter @briefyard/core lint
pnpm --filter @briefyard/core typecheck
pnpm --filter @briefyard/content lint
pnpm --filter @briefyard/content typecheck
```

Expected: all exit 0.

- [ ] **Step 16: Commit**

Run:

```
git add packages/core packages/content pnpm-lock.yaml
git commit -m "feat(core,content): scaffold empty @briefyard/core and @briefyard/content packages"
```

Expected: clean commit.

---

## Task 7 — `apps/web` Next.js shell

**Files:**

- Create: `apps/web/{package.json, tsconfig.json, next.config.mjs, next-env.d.ts, postcss.config.mjs, tailwind.config.ts, .eslintrc.cjs}`
- Create: `apps/web/app/{layout.tsx, page.tsx, globals.css}`
- Create: `apps/web/public/robots.txt`
- Create: `apps/web/e2e/smoke.spec.ts`
- Create: `apps/web/playwright.config.ts`

- [ ] **Step 1: Write `apps/web/package.json`**

Create `D:\thebriefyard\apps\web\package.json`:

```json
{
  "name": "@briefyard/web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint --max-warnings=0",
    "typecheck": "tsc --noEmit",
    "test": "echo 'web has no vitest suite in P0' && exit 0",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@briefyard/core": "workspace:*",
    "@briefyard/content": "workspace:*",
    "@briefyard/types": "workspace:*",
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@briefyard/eslint-config": "workspace:*",
    "@playwright/test": "^1.48.0",
    "@types/node": "^20.12.7",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.15",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Step 2: Write `apps/web/tsconfig.json`**

Create `D:\thebriefyard\apps\web\tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "incremental": true,
    "noEmit": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next"]
}
```

- [ ] **Step 3: Write `apps/web/next.config.mjs`**

Create `D:\thebriefyard\apps\web\next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@briefyard/core', '@briefyard/content', '@briefyard/types'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
```

- [ ] **Step 4: Write `apps/web/next-env.d.ts`**

Create `D:\thebriefyard\apps\web\next-env.d.ts`:

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
```

- [ ] **Step 5: Write Tailwind + PostCSS configs with the "Yard" palette tokens from SPEC §16.1**

Create `D:\thebriefyard\apps\web\tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // "Yard" palette — SPEC §16.1
        yard: {
          primary: '#C2410C',
          rust: '#7C2D12',
          ink: '#1A1A1A',
          cream: '#FAF6EF',
          moss: '#3F6E47',
          fog: '#E7E0D3',
          sun: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

Create `D:\thebriefyard\apps\web\postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

- [ ] **Step 6: Write `app/globals.css`**

Create `D:\thebriefyard\apps\web\app\globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --yard-primary: #c2410c;
  --yard-rust: #7c2d12;
  --yard-ink: #1a1a1a;
  --yard-cream: #faf6ef;
  --yard-moss: #3f6e47;
  --yard-fog: #e7e0d3;
  --yard-sun: #f59e0b;
}

body {
  background: var(--yard-cream);
  color: var(--yard-ink);
}

.dark body {
  background: var(--yard-ink);
  color: var(--yard-cream);
}
```

- [ ] **Step 7: Write `app/layout.tsx`**

Create `D:\thebriefyard\apps\web\app\layout.tsx`:

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'thebriefyard — Practice briefs for designers',
  description:
    'Human-curated combinatorial design briefs. Practice your portfolio with reproducible, shareable briefs. No AI, no paywall.',
  metadataBase: new URL('https://thebriefyard.com'),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Write `app/page.tsx` — minimal placeholder home**

Create `D:\thebriefyard\apps\web\app\page.tsx`:

```tsx
import { CONTENT_VERSION } from '@briefyard/content';
import { JOB_IDS, INDUSTRY_IDS } from '@briefyard/types';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-bold text-4xl text-yard-primary">thebriefyard</h1>
      <p className="mt-4 text-lg">
        Practice briefs for designers. Human-curated. Reproducible. Shareable.
      </p>
      <p className="mt-8 text-sm opacity-70">
        Foundation scaffold. Content version {CONTENT_VERSION}. {JOB_IDS.length} jobs ×{' '}
        {INDUSTRY_IDS.length} industries planned.
      </p>
    </main>
  );
}
```

- [ ] **Step 9: Write `public/robots.txt` (placeholder until SEO routes ship in P3)**

Create `D:\thebriefyard\apps\web\public\robots.txt`:

```
User-agent: *
Disallow: /

# P0 scaffold — site is not ready for indexing. P3 replaces this with a generated
# /robots.txt route serving production directives.
```

- [ ] **Step 10: Write `apps/web/.eslintrc.cjs`**

Create `D:\thebriefyard\apps\web\.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  extends: ['@briefyard/eslint-config', 'next/core-web-vitals'],
};
```

- [ ] **Step 11: Write Playwright config and one smoke test**

Create `D:\thebriefyard\apps\web\playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
  },
  webServer: {
    command: 'pnpm start',
    url: 'http://127.0.0.1:3000',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
```

Create `D:\thebriefyard\apps\web\e2e\smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('home renders the foundation scaffold', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'thebriefyard' })).toBeVisible();
  await expect(page.getByText(/Practice briefs for designers/)).toBeVisible();
});
```

- [ ] **Step 12: Install deps**

Run:

```
pnpm install
```

Expected: Next.js, React, Tailwind, Playwright pulled.

- [ ] **Step 13: Verify the web app builds**

Run:

```
pnpm --filter @briefyard/web build
```

Expected: Next produces `.next/` output, no errors. (Build will print a route table with `/` only.)

- [ ] **Step 14: Verify typecheck and lint**

Run:

```
pnpm --filter @briefyard/web typecheck
pnpm --filter @briefyard/web lint
```

Expected: both exit 0.

- [ ] **Step 15: Install Playwright browsers (one-time)**

Run:

```
pnpm exec playwright install --with-deps chromium
```

Expected: chromium installed.

- [ ] **Step 16: Run the Playwright smoke test against a freshly built server**

Run:

```
pnpm --filter @briefyard/web build
pnpm --filter @briefyard/web test:e2e
```

Expected: 1 test passes.

- [ ] **Step 17: Commit**

Run:

```
git add apps/web pnpm-lock.yaml
git commit -m "feat(web): scaffold Next.js 14 app with Yard palette and smoke e2e"
```

Expected: clean commit.

---

## Task 8 — GitHub Actions CI

**Files:**

- Create: `D:\thebriefyard\.github\workflows\ci.yml`
- Create: `D:\thebriefyard\.github\pull_request_template.md`

- [ ] **Step 1: Write CI workflow**

Create `D:\thebriefyard\.github\workflows\ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  TURBO_TELEMETRY_DISABLED: 1

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - uses: pnpm/action-setup@v4
        with:
          version: 9.12.0

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Format check
        run: pnpm run format:check

      - name: Lint
        run: pnpm run lint

      - name: Typecheck
        run: pnpm run typecheck

      - name: Unit tests
        run: pnpm run test

      - name: Build
        run: pnpm run build

  e2e:
    runs-on: ubuntu-latest
    needs: verify
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9.12.0
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm --filter @briefyard/web build
      - run: pnpm --filter @briefyard/web test:e2e
        env:
          CI: '1'

  spec-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9.12.0
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run spec:check
```

- [ ] **Step 2: Write PR template**

Create `D:\thebriefyard\.github\pull_request_template.md`:

```markdown
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

```

- [ ] **Step 3: Commit**

Run:

```
git add .github
git commit -m "ci: add GitHub Actions CI (verify, e2e, spec-check) and PR template"
```

Expected: clean commit.

---

## Task 9 — `scripts/verify-phase.ts` and `scripts/new-adr.ts`

**Files:**

- Create: `D:\thebriefyard\scripts\verify-phase.ts`
- Create: `D:\thebriefyard\scripts\new-adr.ts`

The phase-check script is intentionally lightweight in P0: it parses `STATE.md`, prints the active phase, and exits 0. P1+ extend it to inspect changed files.

- [ ] **Step 1: Write `scripts/verify-phase.ts`**

Create `D:\thebriefyard\scripts\verify-phase.ts`:

```ts
#!/usr/bin/env tsx
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

function readState(): string {
  return readFileSync(join(repoRoot, 'STATE.md'), 'utf8');
}

function extractPhase(state: string): { phase: string; week: string } {
  const phaseMatch = state.match(/^##\s*Current phase\s*\n+([^\n]+)/m);
  const weekMatch = state.match(/^##\s*Current week\s*\n+([^\n]+)/m);
  if (!phaseMatch || !weekMatch) {
    console.error('STATE.md missing "Current phase" or "Current week" section');
    process.exit(1);
  }
  return { phase: phaseMatch[1].trim(), week: weekMatch[1].trim() };
}

function main(): void {
  const state = readState();
  const { phase, week } = extractPhase(state);
  console.log(`[spec:check] Active phase: ${phase}`);
  console.log(`[spec:check] Week: ${week}`);
  console.log('[spec:check] OK — P0 scope check is informational only.');
}

main();
```

- [ ] **Step 2: Write `scripts/new-adr.ts`**

Create `D:\thebriefyard\scripts\new-adr.ts`:

```ts
#!/usr/bin/env tsx
import { readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const adrDir = join(__dirname, '..', 'docs', 'adrs');

function nextAdrNumber(): number {
  const existing = readdirSync(adrDir).filter((f) => /^ADR-\d{3}-/.test(f));
  const numbers = existing.map((f) => Number.parseInt(f.slice(4, 7), 10));
  return numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function main(): void {
  const title = process.argv.slice(2).join(' ').trim();
  if (!title) {
    console.error('Usage: pnpm adr:new "<title>"');
    process.exit(1);
  }
  const n = nextAdrNumber();
  const num = n.toString().padStart(3, '0');
  const slug = slugify(title);
  const fname = `ADR-${num}-${slug}.md`;
  const path = join(adrDir, fname);
  const today = new Date().toISOString().slice(0, 10);
  const body = `# ADR-${num} — ${title}

- **Date:** ${today}
- **Status:** proposed
- **Supersedes:** —
- **Superseded by:** —

## Context

<!-- What problem are we solving? What constraints apply? -->

## Decision

<!-- The choice, in one paragraph. -->

## Consequences

### Positive
- 

### Negative
- 

### Risks accepted
- 

## Alternatives considered

### A1
### A2

## Notes
`;
  writeFileSync(path, body, { encoding: 'utf8', flag: 'wx' });
  console.log(`Created ${path}`);
}

main();
```

- [ ] **Step 3: Commit**

Run:

```
git add scripts
git commit -m "chore: add verify-phase and new-adr scripts"
```

Expected: clean commit.

---

## Task 10 — License files and README

**Files:**

- Create: `D:\thebriefyard\LICENSE`
- Create: `D:\thebriefyard\LICENSE-content`
- Create: `D:\thebriefyard\README.md`

- [ ] **Step 1: Write MIT `LICENSE`**

Create `D:\thebriefyard\LICENSE`:

```
MIT License

Copyright (c) 2026 thebriefyard contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Write content license pointer**

Create `D:\thebriefyard\LICENSE-content`:

```
The slot corpus authored under `packages/content/locales/**` is licensed under
the Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0).

Full license text: https://creativecommons.org/licenses/by-sa/4.0/legalcode

This license applies ONLY to the JSON corpus and editorial prose authored for
the brief grammar. The TypeScript code, configuration, build scripts, and
application source remain under the MIT license (see LICENSE).

To comply with CC BY-SA 4.0 when reusing the corpus:

  1. Attribute: "thebriefyard slot corpus — https://thebriefyard.com"
  2. Indicate any changes you made.
  3. Distribute your derivative under the same CC BY-SA 4.0 license.
```

- [ ] **Step 3: Write `README.md`**

Create `D:\thebriefyard\README.md`:

````markdown
# thebriefyard

Practice briefs for designers. Human-curated combinatorial brief generator. No AI, no paywall.

> **Status:** P0 (foundation) under construction. Not yet usable. See `STATE.md` for
> the active phase.

## Read this in order

1. `LANDSCAPE.md` — capabilities, segments, landscape decisions (LD). Highest authority.
2. `ROADMAP.md` — versions, triggers, scaling thresholds.
3. `SPEC.md` — architecture, vocabulary, data model, ADRs, phase plan.
4. `STATE.md` — current phase, ADRs active, blockers.
5. `CLAUDE.md` — short hard rules for AI coding agents.

Conflicts: LANDSCAPE > ROADMAP > SPEC.

## Develop

```sh
pnpm install
pnpm verify        # lint + typecheck + tests
pnpm --filter @briefyard/web dev
```
````

## Licenses

- Code: MIT (see `LICENSE`).
- Slot corpus and editorial prose: CC BY-SA 4.0 (see `LICENSE-content`).

## Sub-plans

Implementation is decomposed:

- **P0 — Foundation** (this plan). Monorepo, governance docs, ADRs, CI.
- **P1 — Generator core.** `@briefyard/core` with TDD.
- **P2 — Content library.** `@briefyard/content` schema + pipeline + 1×1 corpus.
- **P3 — Discoverable web.** SSG, routes, SEO scaffolding, deploy preview.
- **P4 — Corpus authoring + launch.** Full 15×20 EN corpus, curated seeds, launch.

Each lives in `docs/superpowers/plans/`.

```

- [ ] **Step 4: Commit**

Run:
```

git add LICENSE LICENSE-content README.md
git commit -m "docs: add MIT license, CC BY-SA content license pointer, and README"

````
Expected: clean commit.

---

## Task 11 — `CLAUDE.md` (root agent rules, ≤ 200 lines)

**Files:**
- Create: `D:\thebriefyard\CLAUDE.md`

- [ ] **Step 1: Write `CLAUDE.md`**

Create `D:\thebriefyard\CLAUDE.md`:
```markdown
# CLAUDE.md

You are working on **thebriefyard** — a practice-brief generator for designers, no AI, no paywall.

## Read in order

1. `LANDSCAPE.md` — capabilities, segments, Landscape Decisions (LD). Highest authority.
2. `ROADMAP.md` — versions, triggers, scaling thresholds, deprecation.
3. `SPEC.md` — architecture, vocabulary, data model, ADRs, phase plan.
4. `STATE.md` — current phase, week, blockers.

Conflicts resolve to the higher document. LANDSCAPE > ROADMAP > SPEC.

## Inviolable rules

1. Before coding, read SPEC §2 (vocabulary) and the active phase's acceptance criteria.
2. If a request contradicts SPEC §3 (non-goals) or any LD: **STOP**. Open an issue tagged
   `landscape-review-needed`.
3. If a request is a future-version feature without its trigger satisfied (ROADMAP):
   **STOP**. Reply "Roadmap, not v1."
4. Out of the current phase's scope: **STOP** and ask.
5. TDD in `@briefyard/core`. Test first, code second.
6. No new dependency without an ADR. Stack is locked in SPEC §7.
7. No `any` in TypeScript. Use `unknown` + narrow.
8. **No `Math.random()`** anywhere in the generator path. Use the seeded PRNG from
   `@briefyard/core`.
9. **No LLM** in v1, v2, or v3. (LD-002.)
10. **No machine translation** of slot corpus. PT entries are authored.
11. Telemetry never blocks user-facing requests.
12. Vocabulary from SPEC §2 is canonical. No new synonyms.
13. Slot schema changes require `CONTENT_VERSION` bump.
14. Slots are JSON in `packages/content/locales/**`. Never author slot text inside TS
    source files.
15. OG images are generated by `satori` at the Edge. Never headless Chromium.
16. PDF is `@react-pdf/renderer`. Never headless Chromium.

## Classification framework (LANDSCAPE §7)

Before implementing any new request:

- **Tier 0** (bug, internal refactor): direct PR.
- **Tier 1** (new L-3, new dep, schema change): ADR in `docs/adrs/`.
- **Tier 2** (new segment, capability change, contradicts an LD): proposal in
  `docs/landscape-decisions/`. **DO NOT implement** without explicit human approval.

If in doubt between Tier 1 and Tier 2, escalate to Tier 2.

## Useful commands

- `pnpm verify` — lint + typecheck + tests
- `pnpm test` — unit tests across the workspace
- `pnpm --filter @briefyard/web dev` — local dev server
- `pnpm spec:check` — prints active phase from STATE.md
- `pnpm adr:new "<title>"` — scaffolds a new ADR

## Where Claude has slipped before in this project

- Tried to add Redis without reading ADR-002. Don't. Stick with Postgres + Vercel cache
  until the threshold in ROADMAP §9 is measured and crossed.
- Used `Math.random()` "just for a quick prototype". No — even prototypes use the seeded
  PRNG. The whole product depends on determinism.
- Called things "task" instead of "step". Use "step" (SPEC §2).
- Added LLM "to expand briefs". Forbidden. (LD-002.)
- Implemented a v2 feature when a user requested it in chat. Check the ROADMAP triggers
  first.
- Took a Tier 2 decision disguised as Tier 1. Always escalate when uncertain.

## When in doubt

- Architecture change → ADR in `docs/adrs/` (Tier 1).
- Cross-segment / new capability → LD in `docs/landscape-decisions/` (Tier 2).
- Timing/scope question → ROADMAP.
- Scaling threshold (Redis, ClickHouse, multi-region) → ROADMAP §9.
- Code style → read existing code in the layer first.
````

- [ ] **Step 2: Verify file length is under 200 lines**

Run (bash on Windows, via Git Bash or WSL):

```
wc -l D:/thebriefyard/CLAUDE.md
```

Expected: number ≤ 200. (If using PowerShell instead:
`(Get-Content D:\thebriefyard\CLAUDE.md | Measure-Object -Line).Lines`.)

- [ ] **Step 3: Commit**

Run:

```
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with inviolable rules and Tier 0/1/2 framework"
```

Expected: clean commit.

---

## Task 12 — `STATE.md`

**Files:**

- Create: `D:\thebriefyard\STATE.md`

- [ ] **Step 1: Write `STATE.md`**

Create `D:\thebriefyard\STATE.md`:

```markdown
# STATE

## Current phase

P0 — Foundation

## Current week

1 of 1 (P0 is a ~1-week effort)

## Active ADRs

ADR-001 through ADR-013. See `docs/adrs/`.

## Active Landscape Decisions

LD-001 through LD-012. See `LANDSCAPE.md`.

## In progress

- Scaffolding the monorepo and governance docs (this plan).

## Blockers

- None.

## Recent decisions

- 2026-05-12: Brand palette "Yard" locked (SPEC §16.1).
- 2026-05-12: Slot corpus license confirmed CC BY-SA 4.0.
- 2026-05-12: Working name `thebriefyard.com` (RDAP-verified available).

## Last reviewed

2026-05-12.
```

- [ ] **Step 2: Verify `pnpm spec:check` parses the file**

Run:

```
pnpm spec:check
```

Expected output (something like):

```
[spec:check] Active phase: P0 — Foundation
[spec:check] Week: 1 of 1 (P0 is a ~1-week effort)
[spec:check] OK — P0 scope check is informational only.
```

- [ ] **Step 3: Commit**

Run:

```
git add STATE.md
git commit -m "docs: add STATE.md tracking active phase, ADRs, and decisions"
```

Expected: clean commit.

---

## Task 13 — `LANDSCAPE.md`

**Files:**

- Create: `D:\thebriefyard\LANDSCAPE.md`

- [ ] **Step 1: Write `LANDSCAPE.md` consolidating SPEC §4 + §5 of the design**

Create `D:\thebriefyard\LANDSCAPE.md`:

```markdown
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
```

- [ ] **Step 2: Commit**

Run:

```
git add LANDSCAPE.md
git commit -m "docs: add LANDSCAPE.md (capabilities, segments, 12 LDs)"
```

Expected: clean commit.

---

## Task 14 — `ROADMAP.md`

**Files:**

- Create: `D:\thebriefyard\ROADMAP.md`

- [ ] **Step 1: Write `ROADMAP.md`**

Create `D:\thebriefyard\ROADMAP.md`:

```markdown
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
```

- [ ] **Step 2: Commit**

Run:

```
git add ROADMAP.md
git commit -m "docs: add ROADMAP.md with triggers, versioning policy, scaling thresholds"
```

Expected: clean commit.

---

## Task 15 — `SPEC.md` (split version of the design doc)

**Files:**

- Create: `D:\thebriefyard\SPEC.md`

The repo's `SPEC.md` is the architecture-and-implementation reference. It pulls everything below L-1/L-2 out of the design doc. Most of it links back to ADRs and the design.

- [ ] **Step 1: Write `SPEC.md`**

Create `D:\thebriefyard\SPEC.md`:

```markdown
# SPEC — Architecture & Implementation Reference

> Source design (frozen at brainstorm-time):
> `docs/superpowers/specs/2026-05-12-thebriefyard-design.md`.
> When in conflict with LANDSCAPE or ROADMAP, those win.

## 1. North Star

thebriefyard is the practice engine for designers: the deepest, most discoverable,
most shareable combinatorial brief generator on the market — no AI, no paywall, no
friction.

## 2. Vocabulary (canonical)

- **Slot, Slot entry, Template** — corpus building blocks.
- **Job** (15 in v1), **Industry** (20 in v1).
- **Hub** — `/brief/[job]/[industry]`. Indexable.
- **Brief** — generated artifact with `seed`, `contentVersion`, full payload.
- **Seed** — 6-char base36 string.
- **Permalink** — `/brief/[job]/[industry]/[seed]`. Curated ⇒ indexable; ad-hoc ⇒ `noindex,follow`.
- **contentVersion** — monotonic integer; bumps on slot semantic changes.
- **Guide** — long-form authored article. v1 phase 2.
- **Locale** — `en` or `pt`. Authored per locale.
- **Expanded mode** — opt-in toggle yielding extra brief fields.

## 3. Non-goals (v1 entire — refuse if requested)

1. No LLM (LD-002).
2. No paid tier (LD-006).
3. No real-client briefing workflow.
4. No marketplace.
5. No mobile/desktop native (LD-011).
6. No multi-modal output.
7. No user accounts (LD-005).
8. No public contribution pipeline (v3+).
9. No multi-region (LD-008).
10. No invasive tracking (LD-012).

## 4. Architecture

### Layers

- **Edge / CDN** (Vercel) — SSG HTML, ISR, Edge runtime for OG.
- **Next.js app** (`apps/web`) — routes, API handlers, sitemap, robots.
- **Generator core** (`@briefyard/core`) — pure seeded TS function. SEG-A.
- **Content library** (`@briefyard/content`) — JSON corpus + Zod schema + loader. SEG-B.
- **Postgres** (Supabase) — analytics-only in v1.

### Canonical flow

1. User visits `/brief/logo/food`.
2. Page is SSG with 10 curated permalinks + interactive generator + 200–400-word blurb.
3. Click "generate new" → POST `/api/brief`.
4. Route handler invokes `generateBrief({job, industry, locale})`.
5. Response includes `seed` and `url`.
6. Client `history.replaceState` to permalink. Permalink valid forever.

### Deterministic generator contract (ADR-004)

For a fixed tuple `(job, industry, locale, seed, contentVersion, expanded)`, the
generator returns byte-identical output across any machine at any future time, while
the corresponding `compiled/content.<contentVersion>.json` exists.

### SEO surface (v1 after Phase 2)

~6,700 indexable URLs: 600 hubs, 6,000 curated permalinks, 70 guides, plus statics.
Ad-hoc permalinks carry `<meta name="robots" content="noindex,follow">`.

### Permanence & export

- OG image: Edge satori, cache 1 year.
- PDF: react-pdf, Node runtime.
- PNG: satori, Edge runtime.
- No asset storage; regenerated from seed.

## 5. Stack (locked — see ADRs)

| Layer             | Tech                              | ADR     |
| ----------------- | --------------------------------- | ------- |
| Framework         | Next.js 14 App Router + TS strict | ADR-001 |
| Styles            | Tailwind + shadcn/ui              | —       |
| DB                | Postgres 16 (Supabase)            | ADR-002 |
| Corpus            | JSON in git                       | ADR-003 |
| Generator         | Pure TS, mulberry32, base36 seeds | ADR-004 |
| Render            | react-pdf (Node) / satori (Edge)  | ADR-005 |
| Auth (v2+)        | better-auth self-hosted           | ADR-006 |
| i18n              | next-intl                         | ADR-007 |
| Licenses          | MIT code / CC BY-SA 4.0 corpus    | ADR-008 |
| DB access         | postgres-js                       | ADR-009 |
| Schema validation | Zod                               | ADR-010 |
| Quality gate      | Husky + lint-staged               | ADR-013 |

Forbidden without ADR: Redis, Kafka, MongoDB, headless Chromium, any LLM provider,
AGPL code, GA4, GTM, ORM heavier than postgres-js.

## 6. Data model

### Slot corpus (filesystem)

`packages/content/locales/{en,pt}/{slots,industries,jobs,guides,ui}.json`.
Compiled artifact: `packages/content/compiled/content.<v>.json` (gitignored).

### Postgres v1

Only `brief_log` and `brief_reaction`. Schema in design doc §9.3.

### Content versioning

`CONTENT_VERSION` monotonic int in `packages/content/version.ts`. Bumped in any PR
that changes slot semantics.

## 7. Phase plan

### Phase 1 (weeks 1–10) — "Generator + 600 hubs"

EN only. 300 (job × industry) pairs. 6,000 indexable URLs. Binary acceptance:

- `pnpm install && pnpm test` passes on fresh clone.
- `pnpm build` produces ≥ 6,000 static pages.
- Lighthouse mobile: Performance ≥ 90, SEO 100, A11y ≥ 95, Best Practices ≥ 95.
- Generator byte-identical across 100 invocations (regression script).
- 1,000 smoke briefs pass `Brief.parse`.
- Permalink + private window → same brief renders server-side.
- PDF/PNG export valid for any seed.
- OG image p95 < 500 ms.
- Sitemap lists 6,000+ URLs.
- Ad-hoc permalinks `noindex`.
- Coverage: core ≥ 95%, web routes ≥ 70%, content validation 100%.
- `main` CI green 5 consecutive commits + 14 consecutive days.

### Phase 2 (weeks 11–20) — "PT-BR + guides + permanence UX"

Add PT corpus, 30 + 40 guides, expanded mode, regenerate-slot, history, sponsor slot,
external a11y audit. Acceptance in design §10.2.

## 8. Anti-patterns

See design §14. Highlights repeated here:

- `Math.random()` in generator → use seeded PRNG.
- Slot text inside TS files → use JSON corpus.
- Machine-translating EN → PT → author per locale.
- Headless Chromium for OG → satori.
- Redis "for cache" → ADR-002 + ROADMAP §6.1.
- Logging IP → truncated UA hash.
- `any` → `unknown` + narrow.
- Hardcoding 300 hubs → `generateAll(jobs, industries)`.
- LLM-generated entries → LD-002.
- Ad-hoc seed in sitemap → `noindex`.

## 9. ADRs (index)

001 — Next.js 14 App Router + TS strict
002 — Postgres single store
003 — Slot corpus as JSON in git
004 — Pure deterministic generator
005 — PDF via react-pdf, OG via satori
006 — better-auth self-hosted (when needed)
007 — next-intl localized routes
008 — Code MIT, corpus CC BY-SA 4.0
009 — No ORM; postgres-js direct
010 — Zod validates corpus in CI
011 — Cookie & privacy policy
012 — Public API rate-limit policy
013 — Husky pre-commit gate

## 10. Quality gates

### Pre-commit (Husky)

lint-staged → prettier → typecheck + test on changed packages.

### Pre-PR (GitHub Actions)

lint, typecheck, test, build, e2e (Playwright), spec-check.
P1+ adds: content-lint, lighthouse, sitemap crawler.

### Pre-release

Full E2E + SEO crawler + manual spot-check + reconcile LANDSCAPE/ROADMAP/SPEC.

## 11. Open gaps (resolved at P0 close)

All gaps from design §16 are resolved at P0 completion:

- License confirmed (CC BY-SA).
- Brand palette locked (Yard).
- Sponsor policy: `docs/sponsor-policy.md`.
- Outreach draft: `docs/outreach-manu.md`.
- `randombrief.com` registration: queued for Phase 1 week 0.
```

- [ ] **Step 2: Commit**

Run:

```
git add SPEC.md
git commit -m "docs: add SPEC.md (architecture, data model, phase plan, ADR index)"
```

Expected: clean commit.

---

## Task 16 — Author 13 ADRs

**Files:**

- Create: `D:\thebriefyard\docs\adrs\README.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-001-nextjs-app-router-typescript.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-002-postgres-single-store.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-003-slot-corpus-json-in-git.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-004-pure-deterministic-generator.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-005-pdf-react-pdf-og-satori.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-006-better-auth-self-hosted.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-007-next-intl-localized-routes.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-008-code-mit-content-ccbysa.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-009-no-orm-postgres-js.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-010-zod-schema-validates-content-in-ci.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-011-cookie-and-privacy-policy.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-012-public-api-rate-limit-policy.md`
- Create: `D:\thebriefyard\docs\adrs\ADR-013-husky-precommit-quality-gate.md`

Each ADR follows the template emitted by `scripts/new-adr.ts`. To keep this plan readable, only the content (Context, Decision, Consequences) is shown per ADR — the header is identical.

- [ ] **Step 1: Write `docs/adrs/README.md`**

Create `D:\thebriefyard\docs\adrs\README.md`:

````markdown
# Architecture Decision Records

ADRs document technical decisions inside an active segment. They are Tier 1 in the
LANDSCAPE §6 framework. Strategic decisions (Tier 2) live in
`docs/landscape-decisions/` (not yet seeded — created when needed).

## How to add

```sh
pnpm adr:new "Title of the decision"
```
````

## Index

- ADR-001 — Next.js 14 App Router + TypeScript strict
- ADR-002 — Postgres as single store (no Redis/Mongo)
- ADR-003 — Slot corpus as JSON in git, not in DB
- ADR-004 — Pure deterministic generator (mulberry32, base36 seeds)
- ADR-005 — PDF via react-pdf (Node); OG/PNG via satori (Edge)
- ADR-006 — better-auth self-hosted when auth is introduced
- ADR-007 — next-intl with localized routes (`/en/*`, `/pt/*`)
- ADR-008 — Code MIT, slot corpus CC BY-SA 4.0
- ADR-009 — No ORM; postgres-js direct with Zod
- ADR-010 — Zod schema validates corpus in CI
- ADR-011 — Cookie and privacy policy (cookieless default)
- ADR-012 — Public API rate-limit policy
- ADR-013 — Husky pre-commit + lint-staged quality gate

````

- [ ] **Step 2: Write ADR-001**

Create `D:\thebriefyard\docs\adrs\ADR-001-nextjs-app-router-typescript.md`:
```markdown
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
````

- [ ] **Step 3: Write ADR-002**

Create `D:\thebriefyard\docs\adrs\ADR-002-postgres-single-store.md`:

```markdown
# ADR-002 — Postgres as single store (no Redis/Mongo)

- **Date:** 2026-05-12
- **Status:** accepted

## Context

v1 needs minimal persistence: analytics (`brief_log`, `brief_reaction`). v2 adds
users, saved briefs, votes. v3 adds contribution PRs and moderation. Most v1
work is read-only against the JSON corpus.

## Decision

Use a single PostgreSQL 16 instance (Supabase managed). No Redis. No MongoDB.
No separate analytics warehouse until ROADMAP §6.3 threshold is measured.

## Consequences

### Positive

- One mental model, one connection pool, one set of credentials.
- Postgres FTS handles in-product search until volume justifies Meilisearch.
- Supabase free tier covers v1 traffic.

### Negative

- Sub-second analytics aggregations may slow as volume grows.

### Risks accepted

- Analytics scale: we will migrate to ClickHouse only when ROADMAP §6.3 threshold
  is observed in telemetry.
```

- [ ] **Step 4: Write ADR-003**

Create `D:\thebriefyard\docs\adrs\ADR-003-slot-corpus-json-in-git.md`:

```markdown
# ADR-003 — Slot corpus as JSON in git, not in DB

- **Date:** 2026-05-12
- **Status:** accepted

## Context

The slot corpus is the product's moat (CAP-3). It must be:

- Reviewable in a PR (diffs matter).
- Versioned with the code that consumes it.
- Loadable at build time for SSG.
- Contribution-ready (SEG-G, v3).

## Decision

Store the corpus as JSON files in `packages/content/locales/{en,pt}/**`. A
build step compiles them into `packages/content/compiled/content.<v>.json`.
Postgres holds zero corpus data.

## Consequences

### Positive

- PR review is line-by-line.
- Schema validation runs at CI time, fails before merge.
- No DB migration to change content.
- Trivial backups (git history).

### Negative

- No live editing without a deploy.
- Localised corpora can drift; parity tests enforce structure (not text).

### Risks accepted

- Build-time loading caps total corpus size at a few MB compiled. v2 corpus
  ~10MB compiled is comfortable; if we ever approach 100MB, revisit.
```

- [ ] **Step 5: Write ADR-004**

Create `D:\thebriefyard\docs\adrs\ADR-004-pure-deterministic-generator.md`:

```markdown
# ADR-004 — Pure deterministic generator (mulberry32, base36 seeds)

- **Date:** 2026-05-12
- **Status:** accepted

## Context

Permalinks (`/brief/[job]/[industry]/[seed]`) require that the same input always
yields the same output, for the lifetime of the corresponding `contentVersion`.
This is non-negotiable for SEO (Google must always see the same brief) and for
sharing.

## Decision

`generateBrief()` is a pure function with no IO and no `Date.now()` or
`Math.random()` calls in its dependency tree. Randomness comes from a seeded
PRNG — **mulberry32** — initialised from the seed string. Seeds are 6-char
base36 (`[0-9a-z]{6}`, ~2.18B combinations).

## Consequences

### Positive

- Byte-identical output across builds, regions, future deploys.
- Trivially testable (1,000 iterations of `expect(generateBrief(x)).toEqual(...)`).
- SSG can pre-render permalinks ahead of time.

### Negative

- Any code that touches the generator path inherits the no-IO discipline.
- Lint rule needed: forbid `Math.random` in `packages/core/**`.

### Risks accepted

- mulberry32 is not cryptographic. Acceptable: seeds are not secrets.
```

- [ ] **Step 6: Write ADR-005**

Create `D:\thebriefyard\docs\adrs\ADR-005-pdf-react-pdf-og-satori.md`:

```markdown
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
```

- [ ] **Step 7: Write ADR-006**

Create `D:\thebriefyard\docs\adrs\ADR-006-better-auth-self-hosted.md`:

```markdown
# ADR-006 — better-auth self-hosted (when auth arrives)

- **Date:** 2026-05-12
- **Status:** accepted (activated in v2, not v1)

## Context

v1 ships without authentication (LD-005). v2's SEG-E (community) requires user
accounts, profiles, and saved briefs. We need an option that runs cheaply,
respects privacy (LD-012), and avoids per-MAU pricing surprises.

## Decision

Use `better-auth` (open source, self-hosted) on top of Supabase Postgres when
auth becomes necessary.

## Consequences

### Positive

- No per-MAU cost. Acceptable as v2 scales.
- Owns the user table; no vendor lock-in.

### Negative

- Maintenance load: SSO integrations are not free.

### Risks accepted

- If SEG-F (enterprise) materialises (v3+), WorkOS sits on top for SSO
  specifically. Documented in ROADMAP §6.5.
```

- [ ] **Step 8: Write ADR-007**

Create `D:\thebriefyard\docs\adrs\ADR-007-next-intl-localized-routes.md`:

```markdown
# ADR-007 — next-intl with localized routes

- **Date:** 2026-05-12
- **Status:** accepted

## Context

LD-004 ships EN + PT-BR from v1. Both locales must be indexable and have proper
hreflang. ES is planned for v2.

## Decision

Use `next-intl` with localized route prefixes (`/en/*`, `/pt/*`). EN is the
default served at `/` (no prefix) for SEO continuity. PT is served at `/pt`.
hreflang tags are emitted on every indexable page from day 1, even when only
EN content exists in Phase 1.

## Consequences

### Positive

- Standard Next.js routing model.
- One source of truth for translatable UI strings (`packages/content/locales/<l>/ui.json`).

### Negative

- Default-locale prefix vs no-prefix has known edge cases. We document the
  canonical convention in `docs/seo-playbook.md`.

### Risks accepted

- Locale negotiation runs in middleware. Small cold-start cost, well below
  Lighthouse budget.
```

- [ ] **Step 9: Write ADR-008**

Create `D:\thebriefyard\docs\adrs\ADR-008-code-mit-content-ccbysa.md`:

```markdown
# ADR-008 — Code MIT, slot corpus CC BY-SA 4.0

- **Date:** 2026-05-12
- **Status:** accepted

## Context

LD-001 declared open core: code is open, business is the moat. But code and
corpus have different reuse dynamics. Code reuse is trivially valuable and we
want it spread (MIT). Corpus reuse is the actual moat — we want forks to
re-share their derivatives.

## Decision

- Code: MIT (`LICENSE` at repo root).
- Slot corpus (`packages/content/locales/**` and authored prose under
  `docs/`): Creative Commons Attribution-ShareAlike 4.0 International
  (`LICENSE-content` at repo root).

## Consequences

### Positive

- Code reuse with no friction.
- Forks of the corpus must remain CC BY-SA, so the ecosystem grows in the open.

### Negative

- Some companies refuse CC BY-SA content for compliance reasons. Acceptable;
  the v1 audience is independent designers.

### Risks accepted

- Re-evaluation to CC BY 4.0 stays open if a strong commercial-reuse demand
  emerges. Decision is reversible by switching license file forward — past
  contributions remain BY-SA per their original terms.
```

- [ ] **Step 10: Write ADR-009**

Create `D:\thebriefyard\docs\adrs\ADR-009-no-orm-postgres-js.md`:

```markdown
# ADR-009 — No ORM; postgres-js direct with Zod

- **Date:** 2026-05-12
- **Status:** accepted

## Context

v1 has two tables. v2 adds about six. The cost of an ORM (query DSL learning,
migration tooling, schema-of-schema) outweighs its value at this scale.

## Decision

Use `postgres-js` for direct SQL. Validate inputs/outputs with Zod schemas
co-located with the relevant module. Migrations are raw SQL files in
`apps/web/db/migrations/`, applied via a small script.

## Consequences

### Positive

- SQL is readable. Performance is predictable.
- Zero ORM-specific bug surface.

### Negative

- Manual joins. Acceptable at our scale.

### Risks accepted

- If complexity grows (v3+), Drizzle is the most likely upgrade — it keeps the
  SQL-first feel.
```

- [ ] **Step 11: Write ADR-010**

Create `D:\thebriefyard\docs\adrs\ADR-010-zod-schema-validates-content-in-ci.md`:

```markdown
# ADR-010 — Zod schema validates corpus in CI

- **Date:** 2026-05-12
- **Status:** accepted

## Context

The corpus is JSON in git (ADR-003). It is also user-contributed (eventually,
SEG-G). A malformed slot entry that ships to production causes runtime errors
in the generator.

## Decision

Every JSON file in `packages/content/locales/**` is validated against Zod
schemas (`packages/content/src/schema.ts`) on every PR via a vitest suite.
The build fails if any file is invalid. A `smoke-1000` test additionally
generates 1,000 random briefs and validates each against `Brief.parse`.

## Consequences

### Positive

- Corpus bugs caught at PR time, not runtime.
- Forbidden-terms list is enforced uniformly.

### Negative

- Schemas must evolve alongside the corpus. PRs that add new slot kinds must
  update schema and tests together.

### Risks accepted

- Schema is more conservative than runtime behaviour: a permissive runtime
  could accept things the schema rejects. We choose schema-strict on purpose.
```

- [ ] **Step 12: Write ADR-011**

Create `D:\thebriefyard\docs\adrs\ADR-011-cookie-and-privacy-policy.md`:

```markdown
# ADR-011 — Cookie and privacy policy (cookieless default)

- **Date:** 2026-05-12
- **Status:** accepted

## Context

LD-012 forbids invasive tracking. PT/EU laws (LGPD, GDPR) require explicit
consent for non-essential cookies. We want minimal legal surface and maximal
respect for users.

## Decision

- Plausible (cookieless) + Vercel Web Analytics (cookieless) are the only
  analytics tools.
- No marketing pixels, no GA4, no GTM.
- No cookies set by us in v1.
- A short, plain-language privacy policy at `/privacy` and `/pt/privacidade`
  drafted at v1 launch and reviewed before PT-BR launch.
- IP addresses are never logged. User-Agent is hashed (truncated SHA-256) and
  stored only for abuse detection.

## Consequences

### Positive

- No cookie banner needed. Better UX. Better Lighthouse score.
- Less legal exposure.

### Negative

- Coarser analytics than third-party tools provide.

### Risks accepted

- If we ever ship a feature that requires a cookie (e.g. saved auth in v2),
  this ADR is amended and a banner is added under standard consent rules.
```

- [ ] **Step 13: Write ADR-012**

Create `D:\thebriefyard\docs\adrs\ADR-012-public-api-rate-limit-policy.md`:

```markdown
# ADR-012 — Public API rate-limit policy

- **Date:** 2026-05-12
- **Status:** accepted

## Context

`/api/brief` is open. The product's brand is "use it freely". But unbounded
abuse (scrapers, key-less integration) burns our Vercel quota and the Supabase
free tier.

## Decision

- Rate-limit at the Edge via Vercel Edge Config (token bucket per IP).
- Limits: 60 req/min, 600 req/hour, 5,000 req/day per IP.
- A `User-Agent` header is required; requests without one return HTTP 400.
- Public documentation at `/docs/api` (Phase 1) explains "use freely, attribute
  source, respect rate limits".
- Repeat offenders (≥ 3 ban-warning cycles) move to a per-IP blocklist
  refreshed daily.

## Consequences

### Positive

- Abusers gated without affecting normal users.
- Public attribution norm reinforces brand.

### Negative

- Rate limits at the Edge add ~1 ms latency.

### Risks accepted

- Aggressive scrapers can rotate IPs. Acceptable: they still hit aggregate
  quotas at the Vercel function level.
```

- [ ] **Step 14: Write ADR-013**

Create `D:\thebriefyard\docs\adrs\ADR-013-husky-precommit-quality-gate.md`:

```markdown
# ADR-013 — Husky pre-commit + lint-staged quality gate

- **Date:** 2026-05-12
- **Status:** accepted

## Context

We want fast local feedback before commits. CI catches everything eventually,
but a 5-minute round trip on a typo is painful for a solo founder.

## Decision

Husky runs a pre-commit hook that invokes `lint-staged` (prettier on staged
files) and `turbo run typecheck test --filter='[HEAD^]'` (only changed
packages). Total expected runtime < 10 s on incremental commits.

## Consequences

### Positive

- Format and trivial typecheck errors caught instantly.
- Turbo cache reuses prior test results.

### Negative

- New contributors need to run `pnpm install` first. The `prepare` hook makes
  this automatic.

### Risks accepted

- The hook can be bypassed with `git commit --no-verify`. CI is the
  authoritative gate.
```

- [ ] **Step 15: Verify `pnpm adr:new` doesn't collide with existing numbers**

Run:

```
pnpm adr:new "Test placeholder"
```

Expected: creates `docs/adrs/ADR-014-test-placeholder.md`. Delete it:

```
rm docs/adrs/ADR-014-test-placeholder.md
```

- [ ] **Step 16: Commit**

Run:

```
git add docs/adrs
git commit -m "docs(adrs): author ADRs 001–013 covering stack, licenses, quality gates"
```

Expected: clean commit (14 files).

---

## Task 17 — Supporting docs

**Files:**

- Create: `D:\thebriefyard\docs\content-style-guide.md`
- Create: `D:\thebriefyard\docs\seo-playbook.md`
- Create: `D:\thebriefyard\docs\sponsor-policy.md`
- Create: `D:\thebriefyard\docs\outreach-manu.md`

- [ ] **Step 1: Write `docs/content-style-guide.md`**

Create `D:\thebriefyard\docs\content-style-guide.md`:

```markdown
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
- No LLM-generated text. Every entry is authored.

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
```

- [ ] **Step 2: Write `docs/seo-playbook.md`**

Create `D:\thebriefyard\docs\seo-playbook.md`:

```markdown
# SEO Playbook

Operational guide for shipping new SEO-relevant pages. Aligns with SPEC §4
(architecture) and SPEC §7 (phase plan).

## Every indexable page must have

- Unique `<title>` (50–60 chars).
- Unique `<meta name="description">` (130–155 chars).
- `<link rel="canonical">` pointing to the canonical URL.
- `hreflang` pair (`en`, `pt`) — emit both even when content for the other
  locale is not yet shipped (link to `/` for the missing one, never to a
  404).
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`.
- Twitter card: `twitter:card`, `twitter:title`, `twitter:description`,
  `twitter:image`.
- JSON-LD matching the page type (see SPEC §6).
- Five or more internal links to related pages.

## Page-type matrix

| Page              | JSON-LD types                                    | Internal links to                                                                       |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `/`               | `WebSite` + `SearchAction`                       | Top-traffic hubs, FAQ                                                                   |
| Hub               | `CollectionPage` + `BreadcrumbList` + `ItemList` | 4 same-industry hubs, 4 same-job hubs, job guide, industry guide, 10 curated permalinks |
| Curated permalink | `CreativeWork` + `BreadcrumbList`                | Parent hub, "generate another", locale alternate                                        |
| Ad-hoc permalink  | none (noindex)                                   | —                                                                                       |
| Guide             | `Article` + `BreadcrumbList` + `Author`          | Related hubs, other related guides                                                      |
| FAQ               | `FAQPage`                                        | —                                                                                       |

## Sitemap rules

- Partition at > 5,000 URLs (`/sitemap-1.xml`, `/sitemap-2.xml`, `/sitemap-index.xml`).
- Include only indexable URLs. Ad-hoc permalinks never in sitemap.
- Lastmod from content version timestamp for permalinks; from build time for
  generated pages.

## Web Vitals budgets

- LCP ≤ 1.5 s on simulated 4G.
- CLS ≤ 0.05.
- INP ≤ 200 ms.
- Total client JS on indexable pages ≤ 60 KB gzipped.
- Self-host fonts via `next/font` (not Google Fonts CDN cascade).

## OG image template

- 1200 × 630 (social standard).
- Background `yard-cream` `#FAF6EF`.
- Brand mark `yard-primary` `#C2410C`.
- Typography `yard-ink` `#1A1A1A`.
- Cached forever at the seed level.
```

- [ ] **Step 3: Write `docs/sponsor-policy.md`**

Create `D:\thebriefyard\docs\sponsor-policy.md`:

```markdown
# Sponsor of the Month — Policy

The single monetization slot in v1 (per LD-006). Hand-selected. No affiliate
tracking, no auction.

## Who fits

- Brand or product is relevant to designers (typefaces, plugins, mockup
  marketplaces, design schools, hardware).
- No predatory finance, gambling, MLM, NFT, generative-AI image services
  (LD-007), or political endorsements.
- The product must work; we vet briefly.

## Where the slot appears (Phase 2+)

- Footer of every page (small inline mention with a single outbound link).
- One spot per guide page near the closing paragraph.

## Pricing

- Manual, monthly. Initial reference: ~US$ 100/month for a single sponsor
  occupying both slots. Adjusted by traffic.

## Disclosure

- Footer text includes "Sponsored by".
- A short post on the about page each month names the sponsor.

## Removal

- 24-hour removal on request from anyone reporting harm.
- Sponsors do not get editorial control or backlinks beyond the single slot.
```

- [ ] **Step 4: Write `docs/outreach-manu.md`**

Create `D:\thebriefyard\docs\outreach-manu.md`:

```markdown
# Outreach draft — Manuel Moreale (Goodbrief.io)

Send at v1 public launch. Cordial, transparent.

---

Subject: Goodbrief inspired a new project — wanted to let you know

Hi Manu,

I'm a long-time fan of Goodbrief. The slot-grammar approach you took (and the
deliberate choice to keep LLMs out of it) shaped a lot of how I think about
the design-practice space.

I've been building thebriefyard — a free combinatorial brief generator that
sits in the same neighbourhood, with a few different bets:

- Authored Portuguese-BR corpus alongside English (different content, not a
  translation).
- Permalinks per generated brief (`/brief/[job]/[industry]/[seed]`).
- Long-tail SEO: a landing page for every (job, industry) pair plus curated
  examples.
- Same philosophical line: no AI in the loop.

The corpus is original — I deliberately didn't reuse Wordlab or any
Goodbrief text. The visual identity diverges too (warmer palette).

I credit Goodbrief in the About page as the inspiration and link back. If
anything about that doesn't sit right, I'd rather hear it from you directly
than from a side door.

Either way, thank you for the original. It's a quiet, lovely thing on the
internet and I hope mine is too.

— [name], thebriefyard.com
```

- [ ] **Step 5: Commit**

Run:

```
git add docs/content-style-guide.md docs/seo-playbook.md docs/sponsor-policy.md docs/outreach-manu.md
git commit -m "docs: add content style guide, SEO playbook, sponsor policy, outreach draft"
```

Expected: clean commit.

---

## Task 18 — Claude Code subagents and slash commands

**Files:**

- Create: `D:\thebriefyard\.claude\settings.json`
- Create: `D:\thebriefyard\.claude\agents\generator-engineer.md`
- Create: `D:\thebriefyard\.claude\agents\content-curator.md`
- Create: `D:\thebriefyard\.claude\agents\seo-engineer.md`
- Create: `D:\thebriefyard\.claude\agents\frontend-engineer.md`
- Create: `D:\thebriefyard\.claude\agents\architect-reviewer.md`
- Create: `D:\thebriefyard\.claude\commands\adr-new.md`
- Create: `D:\thebriefyard\.claude\commands\phase-status.md`
- Create: `D:\thebriefyard\.claude\commands\verify.md`
- Create: `D:\thebriefyard\.claude\commands\content-lint.md`
- Create: `D:\thebriefyard\.claude\commands\seo-audit.md`
- Create: `D:\thebriefyard\.claude\hooks\pre-commit-tests.sh`
- Create: `D:\thebriefyard\.claude\hooks\pre-pr-spec-check.sh`

- [ ] **Step 1: Write `.claude/settings.json`**

Create `D:\thebriefyard\.claude\settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm:*)",
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(node:*)",
      "Bash(tsc:*)",
      "Bash(eslint:*)",
      "Bash(prettier:*)"
    ]
  }
}
```

- [ ] **Step 2: Write `generator-engineer.md`**

Create `D:\thebriefyard\.claude\agents\generator-engineer.md`:

```markdown
---
name: generator-engineer
description: Use for tasks inside @briefyard/core — PRNG, seed encoding, slot picker, generateBrief. Do NOT use for content, frontend, or infrastructure.
tools: Read, Edit, Write, Bash, Grep, Glob
model: opus
---

You are staff engineer on `@briefyard/core`.

Rules:

- SPEC §2 (vocabulary), §4 (architecture), §6 (data model) are canonical.
- TDD mandatory. Failing test before code.
- ADR-004 is non-negotiable: deterministic, no IO, no Math.random.
- Coverage target ≥ 95% lines in `packages/core`.
- Forbid Math.random anywhere in the dep tree.

Before proposing a change, describe in ≤ 5 lines: current state, change, validating
test, accepted risk.
```

- [ ] **Step 3: Write `content-curator.md`**

Create `D:\thebriefyard\.claude\agents\content-curator.md`:

```markdown
---
name: content-curator
description: Use for slot corpus authoring, schema changes, content-lint failures, locale parity. Do NOT use for generator logic or web routing.
tools: Read, Edit, Write, Bash, Grep, Glob
model: opus
---

You are content lead for `@briefyard/content`.

Rules:

- Read `docs/content-style-guide.md` before writing entries.
- ADR-003 (JSON in git) and ADR-010 (Zod-validated in CI) are non-negotiable.
- Bump `CONTENT_VERSION` on any slot semantic change.
- No machine translation EN → PT. Author per locale.
- No LLM-generated text in entries.
- Forbidden-terms list is the floor, not the ceiling.

When editing the schema, update both Zod and tests in the same commit.
```

- [ ] **Step 4: Write `seo-engineer.md`**

Create `D:\thebriefyard\.claude\agents\seo-engineer.md`:

```markdown
---
name: seo-engineer
description: Use for SEO scaffolding — canonical, hreflang, OG, schema.org, sitemap, robots, Web Vitals. Do NOT use for generator logic or content authoring.
tools: Read, Edit, Write, Bash, Grep, Glob
model: opus
---

You are SEO engineer for `apps/web`.

Rules:

- `docs/seo-playbook.md` is canonical operations guide.
- Every indexable page: title, description, canonical, hreflang pair, OG, twitter,
  appropriate JSON-LD, ≥ 5 internal links.
- Ad-hoc permalinks: `noindex,follow`. Never in sitemap.
- Web Vitals budget: LCP ≤ 1.5 s, CLS ≤ 0.05, INP ≤ 200 ms.
- Self-host fonts via `next/font`. No Google Fonts CDN cascade.

Lighthouse failures (Perf < 90, SEO < 100, A11y < 95, Best Practices < 95) block
merge.
```

- [ ] **Step 5: Write `frontend-engineer.md`**

Create `D:\thebriefyard\.claude\agents\frontend-engineer.md`:

```markdown
---
name: frontend-engineer
description: Use for UI work in apps/web — components, routing, layouts, interactive generator, history, expanded mode. Do NOT use for SEO scaffolding or generator core.
tools: Read, Edit, Write, Bash, Grep, Glob
model: opus
---

You are frontend engineer for `apps/web`.

Rules:

- Tailwind + shadcn/ui as base. Use the "Yard" palette tokens from SPEC §16.1.
- Server Components by default. Client Components only where interaction requires.
- A11y first: semantic HTML, ARIA when needed, focus visible, keyboard navigation.
- axe-core in CI must stay clean.
- No `any`. No third-party drag-and-drop libs unless ADR.
- Dark mode supported (yard-ink background, yard-cream text).
```

- [ ] **Step 6: Write `architect-reviewer.md`**

Create `D:\thebriefyard\.claude\agents\architect-reviewer.md`:

```markdown
---
name: architect-reviewer
description: Use BEFORE implementing any change to a public contract, new dependency, schema migration, or cross-segment work. Reviews against SPEC, suggests ADR if needed.
tools: Read, Grep, Glob, WebFetch
model: opus
---

You are an architecture reviewer. You do not write code; you review proposals.

For every proposal, output:

1. Conformance with SPEC §3 (non-goals) and §5 (stack) — yes / no / partial, citing section.
2. Tier classification per LANDSCAPE §6 (0 / 1 / 2). If 2, STOP.
3. Risks (≤ 5 bullets).
4. ADR needed? Yes/no. If yes, 1-paragraph draft.
5. Simpler alternative — always propose one (may be "don't do this now").
6. Verdict: APPROVED / APPROVED-WITH-CHANGES / REJECTED.

Do not soften the verdict. Reject is information, not a social failure.
```

- [ ] **Step 7: Write slash commands**

Create `D:\thebriefyard\.claude\commands\adr-new.md`:

```markdown
Run `pnpm adr:new "$ARGUMENTS"` and report the file created. If `$ARGUMENTS` is empty,
ask the user for an ADR title first.
```

Create `D:\thebriefyard\.claude\commands\phase-status.md`:

```markdown
Run `pnpm spec:check` and print its output verbatim. Then summarise: which acceptance
criteria from SPEC §10 (matching the current phase) are still open, citing the
checklist. Do not invent criteria.
```

Create `D:\thebriefyard\.claude\commands\verify.md`:

```markdown
Run `pnpm verify` (lint + typecheck + test). Print the output. If anything fails, list
exactly which packages and tests failed; do not propose fixes unless asked.
```

Create `D:\thebriefyard\.claude\commands\content-lint.md`:

```markdown
Run `pnpm --filter @briefyard/content test`. Print the output. If any content-lint
test fails (parity, no-duplicates, forbidden-terms, length-bounds), name the file
path and entry. Do not propose fixes unless asked.
```

Create `D:\thebriefyard\.claude\commands\seo-audit.md`:

```markdown
Tell the user this command will become operational in P3 (Discoverable Web). For now,
it is a placeholder. In P3 it will run Lighthouse CI on 5 reference routes
(`/`, one hub, one curated permalink, one guide, /faq) and print pass/fail per
budget.
```

- [ ] **Step 8: Write Claude hooks**

Create `D:\thebriefyard\.claude\hooks\pre-commit-tests.sh`:

```sh
#!/usr/bin/env sh
# Hook executed by Husky pre-commit (see .husky/pre-commit). Lives in .claude/ so the
# Claude Code agent can read it as part of project context, but it is invoked from
# .husky/pre-commit. Do not edit one without the other.

pnpm exec lint-staged
pnpm exec turbo run typecheck test --filter='[HEAD^]' --cache-dir=.turbo
```

Create `D:\thebriefyard\.claude\hooks\pre-pr-spec-check.sh`:

```sh
#!/usr/bin/env sh
# Hook intended for CI / pre-PR. Runs spec:check and content-lint.

set -e
pnpm spec:check
pnpm --filter @briefyard/content test
```

- [ ] **Step 9: Commit**

Run:

```
git add .claude
git commit -m "chore(claude): add settings, 5 subagents, 5 slash commands, 2 hooks"
```

Expected: clean commit.

---

## Task 19 — End-to-end smoke run of the whole pipeline

- [ ] **Step 1: Fresh install**

Run:

```
pnpm install --frozen-lockfile
```

Expected: lockfile honoured, no diff.

- [ ] **Step 2: Format check**

Run:

```
pnpm format:check
```

Expected: exit 0. If files fail, run `pnpm format` then re-commit.

- [ ] **Step 3: Lint, typecheck, test, build (single command)**

Run:

```
pnpm verify
```

Expected: all four pass. Output ends with `Tasks:  N successful, N total`.

- [ ] **Step 4: Build the web app and run the e2e**

Run:

```
pnpm --filter @briefyard/web build
pnpm --filter @briefyard/web test:e2e
```

Expected: e2e passes (1 test).

- [ ] **Step 5: Spec check**

Run:

```
pnpm spec:check
```

Expected: prints "Active phase: P0 — Foundation".

- [ ] **Step 6: Confirm Husky hook still runs**

Run:

```
git commit --allow-empty -m "chore: smoke test pre-commit hook"
```

Expected: hook runs (`lint-staged` finds nothing to do, turbo runs cached typecheck +
test). Commit succeeds.

---

## Task 20 — Push to GitHub and connect Vercel preview

This task is one-time and partly external. Replace `<your-gh-user>` with the actual
account.

- [ ] **Step 1: Create the GitHub repo (manual, external)**

Open `https://github.com/new`. Create a **public** repo named `thebriefyard`. Do
NOT initialise with README or license (we already have them).

- [ ] **Step 2: Add remote and push**

Run:

```
git remote add origin git@github.com:<your-gh-user>/thebriefyard.git
git branch -M main
git push -u origin main
```

Expected: push succeeds, GitHub Actions CI triggers automatically.

- [ ] **Step 3: Verify CI passes on `main`**

Open the Actions tab on GitHub. Verify the `verify`, `e2e`, and `spec-check` jobs
all complete green.

- [ ] **Step 4: Import project into Vercel (manual, external)**

In Vercel: New Project → Import from GitHub → select `thebriefyard`.

**Root Directory:** `apps/web` (click "Edit" and set this — critical for monorepo).
**Framework Preset:** Next.js (auto-detected after setting root).
**Build & Development Settings (override defaults):**

- **Install Command:** `cd ../.. && pnpm install --frozen-lockfile`
- **Build Command:** `cd ../.. && pnpm turbo run build --filter @briefyard/web`
- **Output Directory:** `.next` (default — relative to Root Directory)
- **Development Command:** leave default

**Environment Variables:**

- `TURBO_TELEMETRY_DISABLED=1`
- `ENABLE_EXPERIMENTAL_COREPACK=1` (lets Vercel honour the `packageManager` field in
  root `package.json`)

Click Deploy.

If Vercel fails on "pnpm not found", add `corepack enable && corepack prepare pnpm@9.12.0 --activate` to the start of the install command.

- [ ] **Step 5: Verify Vercel preview deploys**

After the import, Vercel produces a preview URL like
`https://thebriefyard-<random>.vercel.app`. Visit it. Confirm the home page renders
with the "thebriefyard" headline.

- [ ] **Step 6: Update README with the preview URL**

Edit `D:\thebriefyard\README.md`. Add a line under the status block:

```markdown
**Preview:** https://thebriefyard-<your-deployment>.vercel.app
```

- [ ] **Step 7: Commit and push**

Run:

```
git add README.md
git commit -m "docs: add Vercel preview URL to README"
git push
```

Expected: CI re-runs and stays green.

---

## Task 21 — Close P0

- [ ] **Step 1: Verify the binary acceptance criteria for P0**

Manually walk through this checklist. Tick each:

- [ ] `pnpm install --frozen-lockfile` works on a fresh clone (test by deleting `node_modules` and re-installing).
- [ ] `pnpm verify` exits 0.
- [ ] `pnpm build` exits 0, produces `apps/web/.next` and package `dist/` artifacts (for `@briefyard/types`).
- [ ] `pnpm spec:check` prints "P0 — Foundation".
- [ ] GitHub Actions CI green on main for at least 1 push.
- [ ] Vercel preview deploys and the home page renders the foundation scaffold.
- [ ] All 5 governance docs exist at repo root (LANDSCAPE, ROADMAP, SPEC, CLAUDE, STATE).
- [ ] 13 ADRs present in `docs/adrs/`.
- [ ] 5 subagents, 5 slash commands, 2 Claude hooks present in `.claude/`.
- [ ] MIT `LICENSE` and `LICENSE-content` (CC BY-SA 4.0 pointer) present.

- [ ] **Step 2: Update STATE.md**

Edit `D:\thebriefyard\STATE.md`:

```markdown
# STATE

## Current phase

P1 — Generator core (next)

## Current week

0 (between phases — write P1 plan before starting)

## Active ADRs

ADR-001 through ADR-013.

## Active Landscape Decisions

LD-001 through LD-012.

## In progress

- Awaiting P1 plan authoring (`docs/superpowers/plans/<date>-thebriefyard-p1-core.md`).

## Blockers

- None.

## Recent decisions

- 2026-MM-DD: P0 (Foundation) closed. Monorepo and governance ready.
- 2026-05-12: Brand palette "Yard" locked.
- 2026-05-12: Slot corpus license CC BY-SA 4.0.
- 2026-05-12: Working name `thebriefyard.com` (RDAP-verified available).

## Last reviewed

<today's date>.
```

- [ ] **Step 3: Commit and push**

Run:

```
git add STATE.md
git commit -m "docs(state): close P0, mark P1 as next phase"
git push
```

Expected: clean commit, CI green.

- [ ] **Step 4: Tag the foundation**

Run:

```
git tag -a p0-foundation -m "P0 — Foundation complete"
git push origin p0-foundation
```

Expected: tag visible on GitHub.

---

## Plan complete.

After P0 lands and `STATE.md` reads "P1 — Generator core (next)", write the P1 plan
into `docs/superpowers/plans/<date>-thebriefyard-p1-core.md` covering:

- mulberry32 PRNG with chi-squared tests
- seed encoding (base36 6 chars)
- slot picker (weighted)
- template filler
- `generateBrief()` end-to-end
- determinism regression (100 iterations identical)
- smoke-1000 brief generation against the P2-stub corpus

P1 cannot start before P2's minimal viable corpus (1×1 EN slot set) is authored,
because the generator needs real data to validate against. Sequence: P0 → P2-stub → P1.
