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
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Explainability Insights</h1>
        <p className="text-zinc-500 mt-1">
          Understand which specific habits drive your carbon footprint using game-theoretic Shapley Additive Explanations.
        </p>
      </header>

      <RecentActivity
        logs={logs}
        explanations={shapData.explanations}
        onDeleteLog={deleteLog}
      />
    </div>
  );
}
