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
export const CONTENT_VERSION = 2 as const;
