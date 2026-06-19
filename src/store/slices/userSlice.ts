import type { StateCreator } from 'zustand';

import { DEFAULT_USER } from '@/constants/initialState';
import { calculateOnboardingBaseline, calculateMultiVectorBaseline } from '@/utils/carbonCalculations';
import { generateSeedLogs } from '@/utils/seedGenerator';

import type { CarbonStore } from '@/types/store';

/**
 * Zustand slice managing user profile operations and onboarding states.
 */
export const createUserSlice: StateCreator<
  CarbonStore,
  [],
  [],
  Pick<CarbonStore, 'user' | 'setOnboarding' | 'logout'>
> = (set, get) => ({
  user: DEFAULT_USER,

  setOnboarding: (answers, calculatorAnswers) => {
    let baseVal = calculateOnboardingBaseline(answers);
    let region: 'US' | 'UK' | 'EU' | 'IN' | 'Global' = 'Global';

    if (calculatorAnswers) {
      baseVal = calculateMultiVectorBaseline(calculatorAnswers);
      region = calculatorAnswers.region;
    }

    const seedLogs = generateSeedLogs();

    set({
      user: {
        name: answers.name,
        email: answers.email,
        onboardingComplete: true,
        ecoLevel: 1,
        points: 25,
        totalCarbonSaved: 0,
        baselineEmissions: baseVal,
        region,
        calculatorAnswers: calculatorAnswers || null,
      },
      logs: seedLogs,
      badges: get().badges.map((b) => (b.id === 'b-1' ? { ...b, unlocked: true } : b)),
    });
  },

  logout: () => {
    set({
      user: { ...DEFAULT_USER, onboardingComplete: false },
      logs: [],
      chatHistory: [
        {
          id: 'initial',
          role: 'assistant',
          content: 'Hello! I am your AI Climate Coach. I can help analyze your carbon logs, suggest personalized reduction targets, and guide you through challenges. Ask me anything about how to cut your emissions!',
          timestamp: new Date().toISOString(),
        },
      ],
      challenges: get().challenges.map((c) => ({ ...c, status: 'pending' as const })),
      badges: get().badges.map((b) => ({ ...b, unlocked: false })),
    });
  },
});
