'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AccessibleChart } from '@/components/charts/AccessibleChart';

interface TwinForecastChartProps {
  baselineProjected: number;
  simulatedProjected: number;
  days: number;
}

/**
 * TwinForecastChart visualizes OLS forecasted regression and scenario-adjusted projection lines.
 */
export function TwinForecastChart({
  baselineProjected,
  simulatedProjected,
  days,
}: TwinForecastChartProps) {
  // Format daily projection curve coordinates
  const getForecastChartData = () => {
    const dailyPoints = [];
    const baseDaily = baselineProjected / days;
    const simDaily = simulatedProjected / days;
    
    let baseCumulative = 0;
    let simCumulative = 0;

    const interval = Math.max(1, Math.floor(days / 10));

    for (let d = 1; d <= days; d += interval) {
      baseCumulative += baseDaily * interval;
      simCumulative += simDaily * interval;

      dailyPoints.push({
        day: `Day ${d}`,
        Baseline: Math.round(baseCumulative),
        Simulated: Math.round(simCumulative),
      });
    }

    return dailyPoints;
  };

  const chartData = getForecastChartData();

  return (
    <div className="h-60 w-full mt-6">
      <AccessibleChart
        title="Digital Carbon Twin Forecast Curve"
        summary={`Linear regression forecast curve comparing the baseline path (estimated total emissions: ${baselineProjected} kg) against the simulated twin pathway (estimated total emissions: ${simulatedProjected} kg) over a ${days}-day forecasting scope.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="day" stroke="#52525b" fontSize={11} tickLine={false} />
            <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
              labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
            />
            <Line 
              type="monotone" 
              dataKey="Baseline" 
              stroke="#52525b" 
              strokeDasharray="4 4" 
              strokeWidth={2} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="Simulated" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </AccessibleChart>
    </div>
  );
}
