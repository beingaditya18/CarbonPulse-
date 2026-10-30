'use client';

import { useState, useEffect } from 'react';
import { useCarbonData } from '@/hooks/useCarbonData';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

/**
 * InsightsPage handles step 2 (Explain) of the carbon journey, rendering SHAP attributions.
 */
export default function InsightsPage() {
  const [mounted, setMounted] = useState(false);
  const { logs, shapData, deleteLog } = useCarbonData();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-[#065f46] border border-emerald-200 mb-2">
            Game-Theoretic Attribution
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">AI Explainability Insights</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1 text-sm font-medium">
            Understand which specific habits drive your carbon footprint using Shapley Additive Explanations (TreeSHAP).
          </p>
        </div>
      </header>

      <RecentActivity
        logs={logs}
        explanations={shapData.explanations}
        onDeleteLog={deleteLog}
      />
    </div>
  );
}
