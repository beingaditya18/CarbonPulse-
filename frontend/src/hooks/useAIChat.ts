import { useState } from 'react';
import { useCarbonStore } from '@/store/useCarbonStore';

/**
 * Custom React hook managing conversational interactions with the AI Climate Coach.
 */
export function useAIChat() {
  const { chatHistory, addChatMessage, clearChat, logs } = useCarbonStore();
  const [chatInput, setChatInput] = useState('');
  const [isCoachTyping, setIsCoachTyping] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    addChatMessage('user', userMessage);
    setChatInput('');
    setIsCoachTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, { role: 'user', content: userMessage }],
          userLogs: logs.slice(0, 10), // Pass logs as analytical context
        }),
      });

      if (!res.ok) throw new Error('Coach service connection failed.');

      const data = await res.json();
      addChatMessage('assistant', data.content);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      addChatMessage('assistant', `Coach Offline. Quick Tip: Switch to composting or public transit to save up to 40 kg CO₂ monthly. [Details: ${msg}]`);
    } finally {
      setIsCoachTyping(false);
    }
  };

  return {
    chatHistory,
    chatInput,
    setChatInput,
    isCoachTyping,
    handleSendMessage,
    clearChat,
  };
}
