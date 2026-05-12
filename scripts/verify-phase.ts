#!/usr/bin/env tsx
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
