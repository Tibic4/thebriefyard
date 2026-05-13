import { randomBytes } from 'node:crypto';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

/**
 * Returns a fresh 6-char base36 seed (~2.18B combinations). Uses
 * crypto.randomBytes for non-deterministic entropy at the seed boundary;
 * everything downstream of `seedToInt` is fully deterministic.
 */
export function generateSeed(): string {
  const bytes = randomBytes(6);
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += ALPHABET[bytes[i]! % 36];
  }
  return out;
}

/**
 * FNV-1a 32-bit hash of the seed string. Stable across machines, no
 * Math.random involved. Feeds the mulberry32 PRNG initial state.
 */
export function seedToInt(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
