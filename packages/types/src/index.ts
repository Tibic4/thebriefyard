import { z } from 'zod';

/**
 * Canonical literal IDs for jobs and industries. Source of truth: SPEC §9.2.
 * Changing this list requires a content-version bump and an ADR amendment.
 */

export const JobId = z.enum([
  'logo',
  'brand-identity',
  'website',
  'packaging',
  'billboard',
  'illustration',
  'mobile-app',
  'icon-set',
  'social-campaign',
  'presentation',
  'editorial',
  'motion',
  'type-design',
  'merch',
  'wayfinding',
]);
export type JobId = z.infer<typeof JobId>;

export const IndustryId = z.enum([
  'tech',
  'food',
  'fashion',
  'retail',
  'entertainment',
  'education',
  'transportation',
  'real-estate',
  'travel',
  'sports',
  'healthcare',
  'fintech',
  'nonprofit',
  'government',
  'legal',
  'agriculture',
  'religion',
  'gaming',
  'beauty',
  'automotive',
]);
export type IndustryId = z.infer<typeof IndustryId>;

export const LocaleId = z.enum(['en', 'pt']);
export type LocaleId = z.infer<typeof LocaleId>;

/**
 * 6 character base36 seed. Regex enforced.
 */
export const Seed = z.string().regex(/^[0-9a-z]{6}$/);
export type Seed = z.infer<typeof Seed>;

/**
 * Constants for downstream consumers — derived from the Zod enums so any drift fails
 * typecheck.
 */
export const JOB_IDS = JobId.options;
export const INDUSTRY_IDS = IndustryId.options;
export const LOCALE_IDS = LocaleId.options;
