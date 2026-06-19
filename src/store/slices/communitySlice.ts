import type { StateCreator } from 'zustand';

import type { CarbonStore } from '@/types/store';

/**
 * Zustand slice managing user AI chat coach conversations.
 */
export const createCommunitySlice: StateCreator<
  CarbonStore,
  [],
  [],
  Pick<CarbonStore, 'chatHistory' | 'addChatMessage' | 'clearChat'>
> = (set, get) => ({
  chatHistory: [
    {
      id: 'initial',
      role: 'assistant',
      content: 'Hello! I am your AI Climate Coach. I can help analyze your carbon logs, suggest personalized reduction targets, and guide you through challenges. Ask me anything about how to cut your emissions!',
      timestamp: new Date().toISOString(),
    },
  ],

  addChatMessage: (role, content) => {
    set({
      chatHistory: [
        ...get().chatHistory,
        {
          id: `msg-${Date.now()}`,
          role,
          content,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  },

  clearChat: () => {
    set({
      chatHistory: [get().chatHistory[0]],
    });
  },
});
