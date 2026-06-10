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
    <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl flex flex-col h-[480px] justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-bold text-zinc-100">AI Climate Coach</span>
        </div>
        {chatHistory.length > 1 && (
          <button 
            onClick={onClearChat}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
            aria-label="Clear chat conversation"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm scrollbar-thin scrollbar-thumb-zinc-800"
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
            <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-zinc-800 text-zinc-200' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div className={`p-3.5 rounded-2xl leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-zinc-950/80 border border-zinc-800/80 text-zinc-300 rounded-tl-none'
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
            className="flex items-center gap-2 text-zinc-500 text-xs font-semibold animate-pulse pl-1"
          >
            <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
            <span className="sr-only">AI Coach is generating a response...</span>
            <span>Coach is typing responses...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSendMessage} className="flex gap-2 border-t border-zinc-800 pt-4 mt-4">
        <input
          type="text"
          placeholder="Ask how to reduce transit emissions..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 outline-none rounded-xl px-4 py-2.5 text-xs md:text-sm transition-colors text-zinc-300"
          aria-label="Ask AI Coach a question"
        />
        <button
          type="submit"
          disabled={!chatInput.trim() || isCoachTyping}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-colors disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
