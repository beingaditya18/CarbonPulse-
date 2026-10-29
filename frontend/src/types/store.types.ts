/**
 * @fileoverview Zustand State Store schemas and interfaces.
 * Derived entirely from Zod schemas to ensure perfect validation.
 */

import { z } from 'zod';

import {
  BadgeSchema,
  CarbonLogSchema,
  ChallengeSchema,
  CalculatorAnswersSchema,
  type Badge,
  type CarbonLog,
  type Challenge,
  type CalculatorAnswers,
} from './carbon.types';

/**
 * Zod schema for UserProfile.
 */
export const UserProfileSchema = z.object({
  name: z.string(),
  email: z.string(),
  onboardingComplete: z.boolean(),
  ecoLevel: z.number().nonnegative(),
  points: z.number().nonnegative(),
  totalCarbonSaved: z.number(),
  baselineEmissions: z.number().nonnegative(),
  region: z.enum(['US', 'UK', 'EU', 'IN', 'Global']).optional().default('Global'),
  calculatorAnswers: CalculatorAnswersSchema.optional().nullable().default(null),
});

/**
 * TypeScript type representing user profile details, inferred from UserProfileSchema.
 */
export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Zod schema for ChatMessage.
 */
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string(),
});

/**
 * TypeScript type representing a chat message, inferred from ChatMessageSchema.
 */
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * Zod schema representing the complete persisted state structure.
 * This is used to re-validate localStorage reads before state hydrations.
 */
export const PersistedStoreStateSchema = z.object({
  user: UserProfileSchema,
  logs: z.array(CarbonLogSchema),
  chatHistory: z.array(ChatMessageSchema),
  challenges: z.array(ChallengeSchema),
  badges: z.array(BadgeSchema),
});

/**
 * TypeScript type representing the persisted store state.
 */
export type PersistedStoreState = z.infer<typeof PersistedStoreStateSchema>;

/**
 * The full CarbonStore interface representing store actions and state.
 */
export interface CarbonStore {
  user: UserProfile;
  logs: CarbonLog[];
  chatHistory: ChatMessage[];
  challenges: Challenge[];
  badges: Badge[];
  setOnboarding: (
    answers: {
      name: string;
      email: string;
      energy: number;
      transit: number;
      diet: number;
      shopping: number;
      waste: number;
    },
    calculatorAnswers?: CalculatorAnswers
  ) => void;

  addLog: (log: Omit<CarbonLog, 'id' | 'logged_date'> & { logged_date?: string }) => CarbonLog;
  deleteLog: (id: string) => void;
  updateLog: (id: string, updated: Partial<Omit<CarbonLog, 'id'>>) => void;
  acceptChallenge: (id: string) => void;
  completeChallenge: (id: string) => void;
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;
  clearChat: () => void;
  resetStore: () => void;
  logout: () => void;
}
