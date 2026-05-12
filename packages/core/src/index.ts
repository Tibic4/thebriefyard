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
