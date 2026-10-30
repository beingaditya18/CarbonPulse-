'use client';

import { useRef, useEffect, FormEvent } from 'react';
import { Send, Sparkles, Trash2, User } from 'lucide-react';
import { ChatMessage } from '@/types/store';

interface ChatCoachCardProps {
  chatHistory: ChatMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  isCoachTyping: boolean;
  onSendMessage: (e: FormEvent) => void;
  onClearChat: () => void;
}

/**
 * ChatCoachCard renders the AI Climate Coach conversational assistant panel.
 */
export function ChatCoachCard({
  chatHistory,
  chatInput,
  setChatInput,
  isCoachTyping,
  onSendMessage,
  onClearChat,
}: ChatCoachCardProps) {
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isCoachTyping]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-6 rounded-2xl shadow-xs flex flex-col h-[480px] justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-[#047857] dark:bg-emerald-950/40 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 block">AI Climate Coach</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">SMC 22.920-aligned advisor</span>
          </div>
        </div>
        {chatHistory.length > 1 && (
          <button
            onClick={onClearChat}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            aria-label="Clear chat conversation"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-800"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="AI Climate Coach conversation"
        aria-relevant="additions"
      >
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            role="article"
            aria-label={`${msg.role === 'assistant' ? 'AI Coach' : 'You'}: ${msg.content}`}
            className={`flex items-start gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user'
                ? 'bg-[#065f46] text-white'
                : 'bg-emerald-50 text-[#047857] dark:bg-emerald-950/40 dark:text-emerald-400'
              }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div className={`p-3.5 rounded-2xl leading-relaxed ${msg.role === 'user'
                ? 'bg-[#047857] text-white rounded-tr-none shadow-xs'
                : 'bg-slate-50 dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800/80 text-slate-800 dark:text-zinc-300 rounded-tl-none'
              }`}>
              <p className="whitespace-pre-line text-xs md:text-sm font-medium">{msg.content}</p>
            </div>
          </div>
        ))}

        {isCoachTyping && (
          <div
            role="status"
            aria-live="polite"
            aria-label="AI Coach is thinking"
            className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 text-xs font-semibold animate-pulse pl-1"
          >
            <Sparkles className="w-4 h-4 text-[#047857] animate-spin" />
            <span className="sr-only">AI Coach is generating a response...</span>
            <span>Coach is analyzing emissions patterns...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSendMessage} className="flex gap-2 border-t border-slate-100 dark:border-zinc-800 pt-4 mt-4">
        <input
          type="text"
          placeholder="Ask how to reduce transit emissions..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-[#047857] dark:focus:border-emerald-500 outline-none rounded-xl px-4 py-2.5 text-xs md:text-sm transition-colors text-slate-900 dark:text-zinc-300 placeholder:text-slate-400"
          aria-label="Ask AI Coach a question"
        />
        <button
          type="submit"
          disabled={!chatInput.trim() || isCoachTyping}
          className="bg-[#047857] hover:bg-[#065f46] text-white p-2.5 rounded-xl transition-colors disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 disabled:cursor-not-allowed shrink-0 flex items-center justify-center cursor-pointer shadow-xs"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
