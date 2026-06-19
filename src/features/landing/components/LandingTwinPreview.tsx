'use client';

import { useState } from 'react';

interface LandingTwinPreviewProps {
  isDark: boolean;
}

/**
 * LandingTwinPreview displays a simplified digital twin scenario calculator
 * on the marketing landing page to demonstrate real-time forecasting.
 */
export function LandingTwinPreview({ isDark }: LandingTwinPreviewProps) {
  const [acReduction, setAcReduction] = useState(30);
  const [transitDays, setTransitDays] = useState(2);
  
  const baseEmissions = 283; 
  const acSavings = acReduction * 0.45; 
  const transitSavings = transitDays * 12.5; 
  const projectedEmissions = Math.max(80, Math.round((baseEmissions - acSavings - transitSavings) * 10) / 10);
  const totalSavings = Math.round((baseEmissions - projectedEmissions) * 10) / 10;

  return (
    <div className={`border p-6 rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-300 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'}`}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="flex items-center justify-between mb-6 border-b border-zinc-200/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          <p className="text-xs uppercase tracking-wider font-bold text-emerald-400">Digital twin simulation</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
          30 Day Forecast
        </span>
      </div>

      <div className="space-y-6">
        {/* Slider 1: AC usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">AC Usage Reduction</span>
            <span className="font-bold text-emerald-500">{acReduction}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={acReduction}
            onChange={(e) => setAcReduction(Number(e.target.value))}
            className="w-full h-1.5 bg-emerald-500/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="AC Usage Reduction slider"
          />
        </div>

        {/* Slider 2: Transit usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Public Transport Days</span>
            <span className="font-bold text-emerald-500">{transitDays} days/wk</span>
          </div>
          <input
            type="range"
            min="0"
            max="7"
            value={transitDays}
            onChange={(e) => setTransitDays(Number(e.target.value))}
            className="w-full h-1.5 bg-emerald-500/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Public Transport Days slider"
          />
        </div>

        {/* Metrics visual display */}
        <div className="grid grid-cols-2 gap-4 border-t border-zinc-200/10 pt-6 mt-6">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-950/40 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'}`}>
            <p className="text-xs text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Current Forecast</p>
            <p className="text-2xl font-bold text-zinc-400 line-through">{baseEmissions} kg</p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5">
            <p className="text-xs text-emerald-400 font-semibold mb-1 uppercase tracking-wider">Simulated Path</p>
            <p className="text-3xl font-extrabold text-emerald-500">{projectedEmissions} kg</p>
          </div>
        </div>

        <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl text-center text-sm font-semibold border border-emerald-500/10">
          🌱 Instant savings of <strong className="text-emerald-300 font-bold">{totalSavings} kg CO₂</strong> simulated!
        </div>
      </div>
    </div>
  );
}
