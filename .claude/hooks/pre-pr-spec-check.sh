#!/usr/bin/env sh
# Hook intended for CI / pre-PR. Runs spec:check and content-lint.

set -e
pnpm spec:check
pnpm --filter @briefyard/content test
