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
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
              labelStyle={{ color: '#047857', fontWeight: 'bold' }}
            />
            <Line
              type="monotone"
              dataKey="Baseline"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Simulated"
              stroke="#047857"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </AccessibleChart>
    </div>
  );
}
