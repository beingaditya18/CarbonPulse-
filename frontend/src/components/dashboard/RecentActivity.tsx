import { ShapExplanationsCard } from '@/features/dashboard/components/ShapExplanationsCard';
import { RecentLogsCard } from '@/features/dashboard/components/RecentLogsCard';
import { CarbonLog } from '@/types/store';
import { SHAPExplanation } from '@/lib/shapEngine';

interface RecentActivityProps {
  logs: CarbonLog[];
  explanations: SHAPExplanation[];
  onDeleteLog: (id: string) => void;
}

/**
 * RecentActivity component showing historical logs table and their respective game-theoretic SHAP weights.
 */
export function RecentActivity({
  logs,
  explanations,
  onDeleteLog,
}: RecentActivityProps) {
  return (
    <div className="space-y-8">
      <ShapExplanationsCard explanations={explanations} />
      <RecentLogsCard logs={logs} onDeleteLog={onDeleteLog} />
    </div>
  );
}
