'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { AccessibleChart } from '@/components/charts/AccessibleChart';

interface HistoryChartWidgetProps {
  chartData: Array<{
    name: string;
    transportation: number;
    electricity: number;
    food: number;
    shopping: number;
    waste: number;
  }>;
}

const CATEGORY_COLORS = {
  transportation: '#3b82f6',
  electricity: '#eab308',
  food: '#22c55e',
  shopping: '#a855f7',
  waste: '#14b8a6',
};

/**
 * HistoryChartWidget renders a stacked area chart showing monthly emission trends.
 */
export function HistoryChartWidget({ chartData }: HistoryChartWidgetProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xs uppercase tracking-wider font-extrabold text-zinc-500 mb-1">Emission History (Last 30 Days)</h3>
        <p className="text-sm text-zinc-400 font-semibold">Weekly aggregate breakdown in kg CO₂</p>
      </div>

      <div className="h-44 w-full mt-4">
        <AccessibleChart
          title="Emissions History stacked area chart"
          summary="This stacked area chart shows your weekly carbon emissions breakdown in kilograms of CO2 over the last 4 weeks. Category keys include Transportation, Electricity, Food, Shopping, and Waste."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
              <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="transportation" stackId="1" stroke={CATEGORY_COLORS.transportation} fill={CATEGORY_COLORS.transportation} fillOpacity={0.2} />
              <Area type="monotone" dataKey="electricity" stackId="1" stroke={CATEGORY_COLORS.electricity} fill={CATEGORY_COLORS.electricity} fillOpacity={0.2} />
              <Area type="monotone" dataKey="food" stackId="1" stroke={CATEGORY_COLORS.food} fill={CATEGORY_COLORS.food} fillOpacity={0.2} />
              <Area type="monotone" dataKey="shopping" stackId="1" stroke={CATEGORY_COLORS.shopping} fill={CATEGORY_COLORS.shopping} fillOpacity={0.2} />
              <Area type="monotone" dataKey="waste" stackId="1" stroke={CATEGORY_COLORS.waste} fill={CATEGORY_COLORS.waste} fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </AccessibleChart>
      </div>
    </div>
  );
}
