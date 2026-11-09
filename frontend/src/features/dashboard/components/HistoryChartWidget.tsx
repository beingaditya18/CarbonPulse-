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
  transportation: '#0284c7', // Sky Blue
  electricity: '#eab308',    // Energy Amber
  food: '#16a34a',           // Organic Green
  shopping: '#8b5cf6',       // Purple
  waste: '#0d9488',          // Teal
};

/**
 * HistoryChartWidget renders a stacked area chart showing monthly emission trends.
 * Styled with crisp white card background, light grid axes, and clean environmental typography.
 */
export function HistoryChartWidget({ chartData }: HistoryChartWidgetProps) {
  return (
    <div className="bg-white border border-slate-200/90 p-6 rounded-2xl flex flex-col justify-between h-full shadow-xs">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-500 mb-1">
            Historical Trajectory (Last 30 Days)
          </h3>
          <p className="text-base font-bold text-slate-900">
            Weekly Aggregate Emissions Breakdown
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span> Food</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span> Power</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span> Transit</span>
        </div>
      </div>

      <div className="h-44 w-full mt-4">
        <AccessibleChart
          title="Emissions History stacked area chart"
          summary="This stacked area chart shows your weekly carbon emissions breakdown in kilograms of CO2 over the last 4 weeks. Category keys include Transportation, Electricity, Food, Shopping, and Waste."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#e2e8f0', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: '#0f172a'
                }}
                labelStyle={{ color: '#047857', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="food" stackId="1" stroke={CATEGORY_COLORS.food} fill={CATEGORY_COLORS.food} fillOpacity={0.25} />
              <Area type="monotone" dataKey="electricity" stackId="1" stroke={CATEGORY_COLORS.electricity} fill={CATEGORY_COLORS.electricity} fillOpacity={0.25} />
              <Area type="monotone" dataKey="transportation" stackId="1" stroke={CATEGORY_COLORS.transportation} fill={CATEGORY_COLORS.transportation} fillOpacity={0.25} />
              <Area type="monotone" dataKey="shopping" stackId="1" stroke={CATEGORY_COLORS.shopping} fill={CATEGORY_COLORS.shopping} fillOpacity={0.25} />
              <Area type="monotone" dataKey="waste" stackId="1" stroke={CATEGORY_COLORS.waste} fill={CATEGORY_COLORS.waste} fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </AccessibleChart>
      </div>
    </div>
  );
}
