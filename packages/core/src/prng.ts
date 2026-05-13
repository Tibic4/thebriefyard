/**
 * Seeded PRNG. ADR-004 forbids Math.random in @briefyard/core; this is the
 * single approved source of randomness. mulberry32 is a 32-bit PRNG with a
 * period of 2^32 and good distributional properties for non-cryptographic
 * uses — sufficient for combinatorial brief generation.
 */
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
