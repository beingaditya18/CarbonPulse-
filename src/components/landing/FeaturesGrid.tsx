import { RefreshCw, Cpu, BarChart3, ShieldCheck } from 'lucide-react';

interface FeaturesGridProps {
  isDark: boolean;
}

/**
 * FeaturesGrid component displaying the 4 core action columns for CarbonPulse.
 */
export function FeaturesGrid({ isDark }: FeaturesGridProps) {
  return (
    <section className={`py-16 border-t ${isDark ? 'border-zinc-900 bg-zinc-950/40' : 'border-zinc-200 bg-zinc-100/30'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold">Track → Explain → Simulate → Reduce</h2>
          <p className={`text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Four core steps built on Vertex AI and Google APIs to take you from awareness to action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className={`p-6 rounded-xl border transition-all hover:scale-105 duration-300 ${isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'}`}>
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center mb-6">
              <RefreshCw className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Track</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Zero manual fatigue. Upload receipts directly using Google Vision OCR text extraction to auto-log your footprint.
            </p>
          </div>

          <div className={`p-6 rounded-xl border transition-all hover:scale-105 duration-300 ${isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'}`}>
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center mb-6">
              <Cpu className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold mb-2">2. Explain</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Understand why. Transparent SHAP (Shapley Additive exPlanations) shows exact feature contributions to your emissions.
            </p>
          </div>

          <div className={`p-6 rounded-xl border transition-all hover:scale-105 duration-300 ${isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'}`}>
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold mb-2">3. Simulate</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Test before committing. Set up custom reduction scenarios on your Digital Carbon Twin using regression forecasting.
            </p>
          </div>

          <div className={`p-6 rounded-xl border transition-all hover:scale-105 duration-300 ${isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'}`}>
            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold mb-2">4. Reduce</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Execute. Accept localized challenges, log completions, track tree scores, and unlock competitive badges.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
