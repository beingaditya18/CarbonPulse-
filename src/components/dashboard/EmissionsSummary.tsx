import { ScoreGaugeCard } from '@/features/dashboard/components/ScoreGaugeCard';
import dynamic from 'next/dynamic';

const HistoryChartWidget = dynamic(
  () => import('@/features/dashboard/components/HistoryChartWidget').then((mod) => mod.HistoryChartWidget),
  { 
    ssr: false, 
    loading: () => (
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl h-60 animate-pulse flex items-center justify-center">
        <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Loading carbon timeline...</span>
      </div>
    )
  }
);

interface EmissionsSummaryProps {
  currentEmissions: number;
  baseline: number;
  ratio: number;
  grade: string;
  gradeColor: string;
  chartData: {
    name: string;
    transportation: number;
    electricity: number;
    food: number;
    shopping: number;
    waste: number;
  }[];
}

/**
 * EmissionsSummary component rendering the live score gauge and history timeline chart.
 */
export function EmissionsSummary({
  currentEmissions,
  baseline,
  ratio,
  grade,
  gradeColor,
  chartData,
}: EmissionsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-5">
        <ScoreGaugeCard
          currentEmissions={currentEmissions}
          baseline={baseline}
          ratio={ratio}
          grade={grade}
          gradeColor={gradeColor}
        />
      </div>
      <div className="md:col-span-7">
        <HistoryChartWidget chartData={chartData} />
      </div>
    </div>
  );
}
