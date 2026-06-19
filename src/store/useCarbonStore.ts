/**
 * @fileoverview CarbonPulse Global State Store
 * Zustand store with persistence for all carbon tracking data.
 * Handles emissions logs, user profile, achievements,
 * and community data with secure storage validation.
 * @module useCarbonStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { DEFAULT_USER, INITIAL_BADGES, INITIAL_CHALLENGES } from '@/constants/initialState';
import { type CarbonStore } from '@/types/store';
import { validateStorageState } from '@/lib/storage';

import { createAchievementsSlice } from './slices/achievementsSlice';
import { createCommunitySlice } from './slices/communitySlice';
import { createEmissionsSlice } from './slices/emissionsSlice';
import { createUserSlice } from './slices/userSlice';

/**
 * Zustand global store containing the user state, logs, chat coach history, and achievements.
 * Composes domain slices and synchronizes state with localStorage.
 * Includes Zod schema verification on retrieval to enforce a fail-closed trust model.
 */
export const useCarbonStore = create<CarbonStore>()(
  persist(
    (...args) => ({
      ...createUserSlice(...args),
      ...createEmissionsSlice(...args),
      ...createAchievementsSlice(...args),
      ...createCommunitySlice(...args),

      resetStore: () => {
        const [set] = args;
        set({
          user: DEFAULT_USER,
          logs: [],
          chatHistory: [
            {
              id: 'initial',
              role: 'assistant',
              content: 'Hello! I am your AI Climate Coach. I can help analyze your carbon logs, suggest personalized reduction targets, and guide you through challenges. Ask me anything about how to cut your emissions!',
              timestamp: new Date().toISOString(),
            },
          ],
          challenges: INITIAL_CHALLENGES.map((c) => ({ ...c, status: 'pending' as const })),
          badges: INITIAL_BADGES.map((b) => ({ ...b, unlocked: false })),
        });
      },
    }),
    {
      name: 'carbonpulse-store',
      storage: createJSONStorage(() => ({
        getItem: (name: string): string | null => {
          const raw = localStorage.getItem(name);
          return validateStorageState(raw);
        },
        setItem: (name: string, value: string): void => {
          localStorage.setItem(name, value);
        },
        removeItem: (name: string): void => {
          localStorage.removeItem(name);
        },
      })),
    }
  )
);
