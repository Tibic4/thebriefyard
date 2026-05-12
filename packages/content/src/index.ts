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

export { CONTENT_VERSION } from '../version';
