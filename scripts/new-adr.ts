#!/usr/bin/env tsx
import { readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
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
