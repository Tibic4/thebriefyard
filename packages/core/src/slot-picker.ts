export interface Weighted {
  text: string;
  weight: number;
}

/**
 * Weighted random pick. The RNG is injected for determinism — pickWeighted
 * never reaches for Math.random (ADR-004). Throws on empty input rather than
 * returning a degenerate value, because empty slots indicate a content bug.
 */
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
  return items[items.length - 1]!;
}
