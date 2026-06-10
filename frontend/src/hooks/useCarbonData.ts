import { useCarbonStore } from '@/store/useCarbonStore';
import { calculateSHAPExplanations } from '@/lib/shapEngine';
import { calculateEcoGrade } from '@/utils/carbonCalculations';

/**
 * Custom React hook managing emissions data, baseline comparisons, and eco grade scoring.
 */
export function useCarbonData() {
  const { logs, user, addLog, deleteLog, updateLog } = useCarbonStore();

  const shapData = calculateSHAPExplanations(logs);
  const currentEmissions = shapData.predictedEmissions;
  const baseline = user.baselineEmissions;
  const ratio = baseline > 0 ? currentEmissions / baseline : 1.0;
  const { grade, color: gradeColor } = calculateEcoGrade(ratio);

  // Format Recharts daily aggregates for history chart
  const weeklyData = [
    { name: 'Week 1', transportation: 0, electricity: 0, food: 0, shopping: 0, waste: 0 },
    { name: 'Week 2', transportation: 0, electricity: 0, food: 0, shopping: 0, waste: 0 },
    { name: 'Week 3', transportation: 0, electricity: 0, food: 0, shopping: 0, waste: 0 },
    { name: 'Week 4', transportation: 0, electricity: 0, food: 0, shopping: 0, waste: 0 },
  ];

  const now = new Date();
  logs.forEach((log) => {
    const logDate = new Date(log.logged_date);
    const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let weekIdx = -1;
    if (diffDays >= 0 && diffDays < 7) weekIdx = 3;
    else if (diffDays >= 7 && diffDays < 14) weekIdx = 2;
    else if (diffDays >= 14 && diffDays < 21) weekIdx = 1;
    else if (diffDays >= 21 && diffDays < 30) weekIdx = 0;

    if (weekIdx !== -1) {
      weeklyData[weekIdx][log.category] += log.emission_amount;
    }
  });

  const chartData = weeklyData.map(w => ({
    ...w,
    transportation: Math.round(w.transportation),
    electricity: Math.round(w.electricity),
    food: Math.round(w.food),
    shopping: Math.round(w.shopping),
    waste: Math.round(w.waste),
  }));

  return {
    logs,
    user,
    addLog,
    deleteLog,
    updateLog,
    currentEmissions,
    baseline,
    ratio,
    grade,
    gradeColor,
    shapData,
    chartData,
  };
}
