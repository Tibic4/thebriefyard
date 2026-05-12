#!/usr/bin/env sh
# Hook executed by Husky pre-commit (see .husky/pre-commit). Lives in .claude/ so the
# Claude Code agent can read it as part of project context, but it is invoked from
# .husky/pre-commit. Do not edit one without the other.

pnpm exec lint-staged
pnpm exec turbo run typecheck test --filter='[HEAD^]' --cache-dir=.turbo
