'use client';

import { useState, useEffect } from 'react';
import { useCarbonStore } from '@/store/useCarbonStore';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AchievementsPage() {
  const { badges } = useCarbonStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;
  const unlockedPercent = Math.round((unlockedCount / totalCount) * 100);

  // Next target calculations
  const nextTarget = badges.find(b => !b.unlocked);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Badges Vault</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Track gamified badges and achievements earned through carbon-reducing behaviors.
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl text-zinc-400 font-bold text-sm">
          <span>{unlockedCount} / {totalCount} Badges Unlocked ({unlockedPercent}%)</span>
        </div>
      </header>

      {/* OVERVIEW PROGRESS CARD */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
        
        {/* Left progress stats */}
        <div className="md:col-span-8 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Climate Achievement Progress</h2>
            <p className="text-sm text-zinc-400 font-semibold leading-relaxed">
              Earn XP points by logging carbon reductions, scanning OCR receipts, simulating twin models, and completing challenges.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest">
              <span>Vault completion</span>
              <span>{unlockedPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${unlockedPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right next target */}
        <div className="md:col-span-4 p-4 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center gap-3">
          {nextTarget ? (
            <>
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-zinc-500 text-xl font-bold">
                {nextTarget.icon}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Next Target Badge</p>
                <p className="text-xs font-bold text-zinc-300 truncate">{nextTarget.name}</p>
                <p className="text-[10px] text-zinc-500 truncate font-semibold">Req: {nextTarget.requirement}</p>
              </div>
            </>
          ) : (
            <div className="text-center w-full py-1 text-emerald-500 font-bold text-xs flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 animate-pulse" /> Climate Vault Mastered!
            </div>
          )}
        </div>
      </div>

      {/* BADGES MATRIX GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <article 
            key={badge.id}
            role="button"
            tabIndex={badge.unlocked ? 0 : -1}
            aria-label={`${badge.name} badge. ${badge.unlocked ? `Unlocked: ${badge.description}` : `Locked. Requirement: ${badge.requirement}`}`}
            aria-pressed={badge.unlocked}
            aria-disabled={!badge.unlocked}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && badge.unlocked) {
                e.preventDefault();
                alert(`Unlocked achievement: ${badge.name}!`);
              }
            }}
            className={`p-6 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden group outline-none ${
              badge.unlocked 
                ? 'bg-zinc-900/60 border-emerald-500/20 hover:border-emerald-500/40 hover:scale-102 shadow-md shadow-emerald-500/5 focus-visible:ring-2 focus-visible:ring-emerald-500' 
                : 'bg-zinc-900/20 border-zinc-800/80 grayscale'
            }`}
          >
            {/* Unlocked green corner gradient glow */}
            {badge.unlocked && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border transition-colors ${
                  badge.unlocked 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-inner' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                }`}>
                  <span aria-hidden="true">{badge.icon}</span>
                </div>
                {badge.unlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Lock className="w-4 h-4 text-zinc-600" />
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className={`font-extrabold text-sm ${badge.unlocked ? 'text-zinc-200' : 'text-zinc-500'}`}>
                  {badge.name}
                </h3>
                <span className="sr-only">
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </span>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed font-semibold">
                  {badge.description}
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-800/60 pt-3 mt-1 flex justify-between items-center text-[10px] uppercase font-black text-zinc-500 tracking-wider">
              <span>Goal Target</span>
              <span className={badge.unlocked ? 'text-emerald-500' : 'text-zinc-600'}>
                {badge.requirement}
              </span>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}
