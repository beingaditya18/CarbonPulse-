import type { StateCreator } from 'zustand';

import type { CarbonLog, CarbonStore } from '@/types/store';

/**
 * Zustand slice managing user emissions activity logs.
 */
export const createEmissionsSlice: StateCreator<
  CarbonStore,
  [],
  [],
  Pick<CarbonStore, 'logs' | 'addLog' | 'deleteLog' | 'updateLog'>
> = (set, get) => ({
  logs: [],

  addLog: (newLog) => {
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const logged_date = newLog.logged_date || new Date().toISOString();
    const logItem: CarbonLog = {
      ...newLog,
      id,
      logged_date,
    };

    const currentLogs = [logItem, ...get().logs];
    let pointsEarned = 10;
    const updatedBadges = [...get().badges];

    // Check Badge 2: Log 5 carbon activities (excluding seeded)
    const userCreatedLogs = currentLogs.filter((l) => !l.id.startsWith('seed-'));
    if (userCreatedLogs.length >= 5) {
      const b2 = updatedBadges.find((b) => b.id === 'b-2');
      if (b2 && !b2.unlocked) {
        b2.unlocked = true;
        pointsEarned += 50;
      }
    }

    // Check Badge 3: Scan a receipt using AI OCR
    if (logItem.source === 'ocr') {
      const b3 = updatedBadges.find((b) => b.id === 'b-3');
      if (b3 && !b3.unlocked) {
        b3.unlocked = true;
        pointsEarned += 100;
      }
    }

    const newPoints = get().user.points + pointsEarned;
    const newLevel = Math.floor(newPoints / 100) + 1;

    set({
      logs: currentLogs,
      user: {
        ...get().user,
        points: newPoints,
        ecoLevel: newLevel,
      },
      badges: updatedBadges,
    });

    return logItem;
  },

  deleteLog: (id) => {
    set({
      logs: get().logs.filter((log) => log.id !== id),
    });
  },

  updateLog: (id, updated) => {
    set({
      logs: get().logs.map((log) => (log.id === id ? { ...log, ...updated } : log)),
    });
  },
});
