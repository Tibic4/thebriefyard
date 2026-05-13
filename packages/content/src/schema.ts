import { IndustryId, JobId, LocaleId, Seed } from '@briefyard/types';
import { z } from 'zod';

export const SlotEntry = z.object({
  text: z.string().min(1).max(280),
  weight: z.number().int().positive().default(1),
  tags: z.array(z.string()).optional(),
  contributor: z.string().optional(),
});
export type SlotEntry = z.infer<typeof SlotEntry>;

export const Template = z.object({
  pattern: z.string().min(1),
  minLength: z.number().int().positive().optional(),
});
export type Template = z.infer<typeof Template>;

export const IndustryFile = z.object({
  id: IndustryId,
  locale: LocaleId,
  displayName: z.string().min(1),
  blurb: z.string().min(200).max(2000),
  slots: z.record(z.string(), z.array(SlotEntry).min(1)),
  templates: z.array(Template).min(1),
  seoTitle: z.string().min(20).max(70),
  seoDescription: z.string().min(50).max(160),
});
export type IndustryFile = z.infer<typeof IndustryFile>;

export const JobFile = z.object({
  id: JobId,
  locale: LocaleId,
  displayName: z.string().min(1),
  blurb: z.string().min(200).max(2000),
  jobDescriptionTemplates: z.array(z.object({ pattern: z.string().min(1) })).min(1),
  jobSlots: z.record(z.string(), z.array(SlotEntry).min(1)),
  seoTitle: z.string().min(20).max(70),
  seoDescription: z.string().min(50).max(160),
});
export type JobFile = z.infer<typeof JobFile>;

export const SharedSlots = z.record(z.string(), z.array(SlotEntry).min(1));
export type SharedSlots = z.infer<typeof SharedSlots>;

export const Brief = z.object({
  seed: Seed,
  job: JobId,
  industry: IndustryId,
  locale: LocaleId,
  contentVersion: z.number().int().positive(),
  company: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    audience: z.string().min(1),
    values: z.string().optional(),
  }),
  deliverable: z.object({
    description: z.string().min(1),
    constraints: z.array(z.string()),
    useCases: z.array(z.string()),
  }),
  deadline: z.string().min(1),
  expanded: z
    .object({
      competitiveContext: z.string().optional(),
      creativeConstraint: z.string().optional(),
      moodWords: z.array(z.string()).optional(),
      forbidden: z.array(z.string()).optional(),
    })
    .optional(),
  generatedAt: z.string().datetime(),
});
export type Brief = z.infer<typeof Brief>;
