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
 * Refactored for environmental standard white & green aesthetics.
 */
export function ScoreGaugeCard({
  currentEmissions,
  baseline,
  ratio,
  grade,
  gradeColor,
}: ScoreGaugeCardProps) {
  // Convert gradeColor classes from dark-mode to vibrant high-contrast environmental colors
  const resolvedGradeColor =
    grade === 'A' ? 'text-[#047857]' :
      grade === 'B' ? 'text-emerald-600' :
        grade === 'C' ? 'text-amber-600' :
          grade === 'D' ? 'text-orange-600' : (gradeColor || 'text-red-600');

  return (
    <div className="bg-white border border-slate-200/90 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xs h-full">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
          Environmental Rating
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#047857] border border-emerald-200">
          Scope 1 & 2
        </span>
      </div>

      <div className="relative w-36 h-36 flex items-center justify-center mb-4">
        {/* SVG Gauge */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r="60"
            className="stroke-slate-100"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r="60"
            className="stroke-[#047857]"
            strokeWidth="10"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={377}
            strokeDashoffset={377 - (377 * Math.min(1.0, Math.max(0.05, 1.2 - ratio)))}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-5xl font-black ${resolvedGradeColor}`}>{grade}</span>
          <span className="text-[10px] uppercase font-extrabold text-slate-500 mt-0.5">
            Ratio: {Math.round(ratio * 100)}%
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-black text-slate-900">{currentEmissions} <span className="text-sm font-semibold text-slate-500">kg CO₂e/mo</span></p>
        <p className="text-xs text-slate-500 font-medium">Target Statutory Cap: <strong className="text-slate-700 font-bold">{baseline} kg</strong></p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 w-full text-left space-y-1.5">
        <div className="flex justify-between text-xs text-slate-600">
          <span>Performance tier:</span>
          <strong className="text-[#047857] font-bold">
            {ratio <= 0.8 ? 'High Efficiency' : ratio <= 1.0 ? 'Compliant' : 'Needs Intervention'}
          </strong>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#047857] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
