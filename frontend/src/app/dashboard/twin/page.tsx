'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useCarbonStore } from '@/store/useCarbonStore';
import { CategoryType } from '@/types/store';
import { simulateTwinEmissions } from '@/lib/twinRegression';
import { TwinAvatar } from '@/features/twin/components/TwinAvatar';
import { EmptyTwin } from '@/components/feedback/EmptyTwin';
import { Activity, Play } from 'lucide-react';

// Dynamic import of forecast chart widget for performance
const TwinForecastChart = dynamic(
  () => import('@/features/twin/components/TwinForecastChart').then((mod) => mod.TwinForecastChart),
  {
    ssr: false,
    loading: () => (
      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl h-60 animate-pulse flex items-center justify-center">
        <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Loading digital twin chart...</span>
      </div>
    )
  }
);

/**
 * CarbonTwinPage enables scenario modeling and forecasting of user carbon paths.
 */
export default function CarbonTwinPage() {
  const { logs } = useCarbonStore();
  const [mounted, setMounted] = useState(false);

  // Simulation Parameters
  const [targetCategory, setTargetCategory] = useState<CategoryType>('transportation');
  const [reductionPercent, setReductionPercent] = useState(30);
  const [days, setDays] = useState(30);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRun, setSimulationRun] = useState(false);

  const [simResults, setSimResults] = useState({
    baselineProjected: 240,
    simulatedProjected: 195,
    carbonSaved: 45,
    scenarioDescription: '',
  });

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  // Sync simulation outputs dynamically
  useEffect(() => {
    if (mounted && logs.length > 0) {
      const results = simulateTwinEmissions(logs, targetCategory, reductionPercent, days);
      setTimeout(() => {
        setSimResults(results);
      }, 0);
    }
  }, [targetCategory, reductionPercent, days, logs, mounted]);

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulationRun(false);

    setTimeout(() => {
      setIsSimulating(false);
      setSimulationRun(true);

      const currentBadges = useCarbonStore.getState().badges;
      const b4 = currentBadges.find(b => b.id === 'b-4');
      if (b4 && !b4.unlocked) {
        useCarbonStore.setState((state) => ({
          badges: state.badges.map(b => b.id === 'b-4' ? { ...b, unlocked: true } : b),
          user: { ...state.user, points: state.user.points + 50 },
        }));
      }
    }, 1200);
  };

  if (!mounted) return null;

  const isTwinHealthy = simResults.simulatedProjected < simResults.baselineProjected;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-[#065f46] border border-emerald-200 mb-2">
            Predictive Simulation Engine
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">AI Carbon Twin</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1 text-sm font-medium">
            Simulate scenario reductions across transport, power, diet, and waste before modifying habits.
          </p>
        </div>
      </header>

      {/* DUAL WORKSPACE LAYOUT */}
      {logs.length < 7 ? (
        <EmptyTwin />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* LEFT COLUMN: PARAMETER SETTING & PROJECTIONS */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-6">

            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 dark:text-zinc-500 mb-1">Scenario Parameters</h3>
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-200">Model Lifestyle Modifications</h2>
              </div>

              {/* Inputs sliders */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="sim-target" className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Target Category</label>
                  <select
                    id="sim-target"
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value as CategoryType)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-800 dark:text-zinc-200 capitalize cursor-pointer font-bold outline-none focus:border-[#047857]"
                  >
                    <option value="transportation">Transportation</option>
                    <option value="electricity">Electricity</option>
                    <option value="food">Diet & Food</option>
                    <option value="shopping">Shopping</option>
                    <option value="waste">Waste & Composting</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Reduction Intensity</span>
                    <span className="font-bold text-[#047857] dark:text-emerald-400">{reductionPercent}% reduction</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    step="5"
                    value={reductionPercent}
                    onChange={(e) => setReductionPercent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#047857]"
                    aria-label="Reduction Intensity slider"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Forecasting Scope</span>
                    <span className="font-bold text-[#047857] dark:text-emerald-400">{days} Days Ahead</span>
                  </div>
                  <div className="flex gap-2">
                    {[30, 60, 90].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDays(d)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${days === d
                            ? 'bg-[#047857] border-[#047857] text-white shadow-xs'
                            : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                          }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full bg-[#047857] hover:bg-[#065f46] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300 dark:disabled:bg-emerald-900 disabled:cursor-not-allowed"
              >
                {isSimulating ? (
                  <>
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Calibrating Twin model parameters...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Simulate Scenario Predictions</span>
                  </>
                )}
              </button>
            </div>

            {simulationRun && (
              <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-6 animate-in fade-in duration-500 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-xl">
                    <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-wider mb-1">Baseline Path</p>
                    <p className="text-xl font-bold text-slate-500 dark:text-zinc-400 line-through">{simResults.baselineProjected} kg</p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                    <p className="text-[10px] text-[#065f46] dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Simulated Twin</p>
                    <p className="text-2xl font-black text-[#047857] dark:text-emerald-500">{simResults.simulatedProjected} kg</p>
                  </div>
                  <div className="p-4 bg-emerald-100/70 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-xl flex flex-col justify-center">
                    <p className="text-[10px] text-[#065f46] dark:text-emerald-300 font-bold uppercase tracking-wider mb-1">Net Savings</p>
                    <p className="text-xl font-extrabold text-[#047857] dark:text-emerald-400">-{simResults.carbonSaved} kg</p>
                  </div>
                </div>

                {/* Forecast curve line chart */}
                <TwinForecastChart
                  baselineProjected={simResults.baselineProjected}
                  simulatedProjected={simResults.simulatedProjected}
                  days={days}
                />
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: DIGITAL TWIN VISUAL MODEL */}
          <div className="lg:col-span-5">
            <TwinAvatar isTwinHealthy={isTwinHealthy} />
          </div>

        </div>
      )}

    </div>
  );
}
