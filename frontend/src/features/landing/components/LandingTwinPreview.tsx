'use client';

import { useState } from 'react';
import { Sparkles, TrendingDown } from 'lucide-react';

interface LandingTwinPreviewProps {
  isDark: boolean;
}

/**
 * LandingTwinPreview displays an environmental standard digital twin scenario calculator
 * demonstrating real-time building emissions forecasting and retrofit simulation.
 */
export function LandingTwinPreview({ isDark }: LandingTwinPreviewProps) {
  const [acReduction, setAcReduction] = useState(30);
  const [transitDays, setTransitDays] = useState(2);

  const baseEmissions = 283;
  const acSavings = acReduction * 0.45;
  const transitSavings = transitDays * 12.5;
  const projectedEmissions = Math.max(80, Math.round((baseEmissions - acSavings - transitSavings) * 10) / 10);
  const totalSavings = Math.round((baseEmissions - projectedEmissions) * 10) / 10;
  const pctReduction = Math.round((totalSavings / baseEmissions) * 100);

  return (
    <div className={`p-6 sm:p-7 rounded-3xl shadow-xl border relative overflow-hidden transition-all duration-300 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-emerald-100 shadow-emerald-950/5'
      }`}>
      {/* Decorative eco gradient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Header bar of preview widget */}
      <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <div>
            <p className="text-xs uppercase tracking-wider font-extrabold text-[#047857]">Digital Twin Simulator</p>
            <p className="text-[11px] text-slate-500 font-medium">Predictive Building Scenario Model</p>
          </div>
        </div>
        <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${isDark
            ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
            : 'bg-emerald-50 text-[#047857] border-emerald-200'
          }`}>
          30-Day Forecast
        </span>
      </div>

      <div className="space-y-5">
        {/* Slider 1: HVAC / AC usage */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
              HVAC Setpoint Optimization
            </span>
            <span className="font-extrabold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              {acReduction}% Efficiency
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={acReduction}
            onChange={(e) => setAcReduction(Number(e.target.value))}
            className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-[#047857]"
            aria-label="HVAC Setpoint Optimization slider"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Standard baseline</span>
            <span>Max deep retrofit</span>
          </div>
        </div>

        {/* Slider 2: Operational schedule / Transit */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
              Low-Carbon Commute Days
            </span>
            <span className="font-extrabold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              {transitDays} days / wk
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="7"
            value={transitDays}
            onChange={(e) => setTransitDays(Number(e.target.value))}
            className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-[#047857]"
            aria-label="Low-Carbon Commute Days slider"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>0 days</span>
            <span>7 days</span>
          </div>
        </div>

        {/* Metrics comparison display */}
        <div className={`grid grid-cols-2 gap-3 pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Baseline Status</p>
            <p className="text-xl font-black text-slate-400 line-through">{baseEmissions} <span className="text-xs font-semibold">kg CO₂e</span></p>
            <p className="text-[10px] text-slate-400 mt-1">Pre-intervention</p>
          </div>

          <div className={`p-3.5 rounded-2xl border border-emerald-200 ${isDark ? 'bg-emerald-950/40 text-emerald-300' : 'bg-emerald-50/70 text-[#047857]'
            }`}>
            <p className="text-[10px] font-extrabold uppercase tracking-wider mb-1 text-emerald-700">Twin Simulation</p>
            <p className="text-2xl font-black text-[#047857]">{projectedEmissions} <span className="text-xs font-bold">kg</span></p>
            <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> -{pctReduction}% footprint
            </p>
          </div>
        </div>

        {/* Savings banner */}
        <div className="bg-[#047857] text-white p-3.5 rounded-2xl text-center text-xs font-bold shadow-sm flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>Verifiable reduction of <strong className="text-emerald-200 underline">{totalSavings} kg CO₂e / month</strong></span>
        </div>
      </div>
    </div>
  );
}
