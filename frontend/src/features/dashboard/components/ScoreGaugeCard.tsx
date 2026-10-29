'use client';

interface ScoreGaugeCardProps {
  currentEmissions: number;
  baseline: number;
  ratio: number;
  grade: string;
  gradeColor: string;
}

/**
 * ScoreGaugeCard renders the circular carbon emissions grade gauge.
 */
export function ScoreGaugeCard({
  currentEmissions,
  baseline,
  ratio,
  grade,
  gradeColor,
}: ScoreGaugeCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
      
      <h3 className="text-xs uppercase tracking-wider font-extrabold text-zinc-500 mb-4 self-start">Carbon Footprint Grade</h3>
      
      <div className="relative w-36 h-36 flex items-center justify-center mb-4">
        {/* SVG Gauge */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r="60"
            className="stroke-zinc-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r="60"
            className="stroke-emerald-500"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={377}
            strokeDashoffset={377 - (377 * Math.min(1.0, 1.2 - ratio))}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-5xl font-black ${gradeColor}`}>{grade}</span>
          <span className="text-[10px] uppercase font-extrabold text-zinc-500 mt-1">Ratio: {Math.round(ratio * 100)}%</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xl font-bold">{currentEmissions} kg CO₂ / mo</p>
        <p className="text-xs text-zinc-500 font-semibold">Baseline Target: {baseline} kg</p>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800/80 w-full text-left space-y-2">
        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">
          <span>IPCC 1.5°C Climate Target</span>
          <span className={((currentEmissions * 12) / 1000) <= 2.3 ? "text-emerald-500 font-bold" : "text-yellow-500 font-bold"}>
            {((currentEmissions * 12) / 1000) <= 2.3 ? "Aligned" : "Above Limit"}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-bold text-zinc-400">Sustainable Cap:</span>
          <span className="text-xs font-black text-emerald-400">2.3 t CO₂e / yr</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-bold text-zinc-400">Your Current Pace:</span>
          <span className={`text-xs font-black ${((currentEmissions * 12) / 1000) <= 2.3 ? "text-emerald-400" : "text-yellow-500"}`}>
            {Math.round(((currentEmissions * 12) / 1000) * 10) / 10} t CO₂e / yr
          </span>
        </div>
      </div>
    </div>
  );
}
