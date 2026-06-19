import type { StateCreator } from 'zustand';

import { INITIAL_BADGES, INITIAL_CHALLENGES } from '@/constants/initialState';

import type { CarbonStore } from '@/types/store';

/**
 * Zustand slice managing user achievements, badges, and challenge updates.
 */
export const createAchievementsSlice: StateCreator<
  CarbonStore,
  [],
  [],
  Pick<CarbonStore, 'challenges' | 'badges' | 'acceptChallenge' | 'completeChallenge'>
> = (set, get) => ({
  challenges: INITIAL_CHALLENGES,
  badges: INITIAL_BADGES,

  acceptChallenge: (id) => {
    set({
      challenges: get().challenges.map((c) =>
        c.id === id ? { ...c, status: 'accepted' as const } : c
      ),
    });
  },

  completeChallenge: (id) => {
    let pointsEarned = 0;
    let carbonSaved = 0;
    const updatedChallenges = get().challenges.map((c) => {
      if (c.id === id) {
        pointsEarned = c.pointsReward;
        carbonSaved = c.potential_impact / 4;
        return { ...c, status: 'completed' as const };
      }
      return c;
    });

    const updatedBadges = [...get().badges];
    const b5 = updatedBadges.find((b) => b.id === 'b-5');
    if (b5 && !b5.unlocked) {
      b5.unlocked = true;
      pointsEarned += 100;
    }

    const newPoints = get().user.points + pointsEarned;
    const newLevel = Math.floor(newPoints / 100) + 1;

    const b6 = updatedBadges.find((b) => b.id === 'b-6');
    if (b6 && !b6.unlocked && newPoints >= 500) {
      b6.unlocked = true;
    }

    set({
      challenges: updatedChallenges,
      user: {
        ...get().user,
        points: newPoints,
        ecoLevel: newLevel,
        totalCarbonSaved: get().user.totalCarbonSaved + carbonSaved,
      },
      badges: updatedBadges,
    });
  },
});
