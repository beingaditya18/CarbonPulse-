/**
 * @fileoverview Carbon-related core types and schemas.
 * Derived entirely from Zod schemas to ensure perfect validation.
 */

import { z } from 'zod';

/**
 * Zod schema defining the valid carbon emission categories.
 */
export const CategoryTypeSchema = z.enum([
  'transportation',
  'food',
  'electricity',
  'shopping',
  'waste',
]);

/**
 * TypeScript type representing carbon emission categories, inferred from CategoryTypeSchema.
 */
export type CategoryType = z.infer<typeof CategoryTypeSchema>;

/**
 * Zod schema defining a single carbon log item.
 */
export const CarbonLogSchema = z.object({
  id: z.string(),
  category: CategoryTypeSchema,
  emission_amount: z.number().nonnegative(),
  source: z.enum(['manual', 'ocr']),
  description: z.string(),
  logged_date: z.string(),
});

/**
 * TypeScript type representing a carbon log item, inferred from CarbonLogSchema.
 */
export type CarbonLog = z.infer<typeof CarbonLogSchema>;

/**
 * Zod schema defining a community or reduction challenge.
 */
export const ChallengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  potential_impact: z.number(),
  category: CategoryTypeSchema,
  status: z.enum(['pending', 'accepted', 'completed']),
  pointsReward: z.number(),
});

/**
 * TypeScript type representing a challenge, inferred from ChallengeSchema.
 */
export type Challenge = z.infer<typeof ChallengeSchema>;

/**
 * Zod schema defining an unlockable reward badge.
 */
export const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  requirement: z.string(),
  pointsRequired: z.number(),
  icon: z.string(),
  unlocked: z.boolean(),
});

/**
 * TypeScript type representing an achievement badge, inferred from BadgeSchema.
 */
export type Badge = z.infer<typeof BadgeSchema>;
