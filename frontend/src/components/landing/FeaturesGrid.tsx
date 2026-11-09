import { RefreshCw, Cpu, BarChart3, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FeaturesGridProps {
  isDark: boolean;
}

/**
 * FeaturesGrid component displaying the 4 core environmental action pillars for CarbonPulse.
 * Refactored to environmental standard design with fresh green highlights, white cards, and high contrast.
 */
export function FeaturesGrid({ isDark }: FeaturesGridProps) {
  return (
    <section className={`py-20 border-t ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-emerald-100 bg-gradient-to-b from-white via-emerald-50/30 to-white'}`}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-[#065f46] uppercase tracking-wider">
            Verified Environmental Methodology
          </div>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Track → Explain → Simulate → Reduce
          </h2>
          <p className={`text-base sm:text-lg leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Built on statutory municipal building benchmark datasets and game-theoretic machine learning (TreeSHAP) to transform abstract emissions numbers into defensible climate interventions.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Pillar 1: Track */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-emerald-100 shadow-sm'
            }`}>
            <div className="w-12 h-12 bg-emerald-100 text-[#047857] rounded-xl flex items-center justify-center mb-5 font-bold shadow-inner">
              <RefreshCw className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="text-xs font-extrabold text-[#047857] uppercase tracking-wider mb-1">Pillar 1</div>
            <h3 className={`text-xl font-black mb-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>1. Ingestion & Audit</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Withhold utility leakage to evaluate true structural emissions. Automate ingestion via Google Vision OCR for receipts and municipal building files.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> SMC 22.920 Compliant
            </div>
          </div>

          {/* Pillar 2: Explain */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-emerald-100 shadow-sm'
            }`}>
            <div className="w-12 h-12 bg-emerald-100 text-[#047857] rounded-xl flex items-center justify-center mb-5 font-bold shadow-inner">
              <Cpu className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="text-xs font-extrabold text-[#047857] uppercase tracking-wider mb-1">Pillar 2</div>
            <h3 className={`text-xl font-black mb-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>2. Transparent XAI</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Replace black-box neural nets with TreeSHAP and SplineGAM. Local additivity verified with error &lt; 10⁻⁵ on native log target scale.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> Numerical additivity checked on the log1p scale (Random Forest, XGBoost)
            </div>
          </div>

          {/* Pillar 3: Simulate */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-emerald-100 shadow-sm'
            }`}>
            <div className="w-12 h-12 bg-emerald-100 text-[#047857] rounded-xl flex items-center justify-center mb-5 font-bold shadow-inner">
              <BarChart3 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="text-xs font-extrabold text-[#047857] uppercase tracking-wider mb-1">Pillar 3</div>
            <h3 className={`text-xl font-black mb-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>3. Digital Twin</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Forecast facility intervention outcomes. Model gross floor area changes (+5% GFA perturbation verified) and vintage retrofits before committing capital.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Cosine Stability (0.985)
            </div>
          </div>

          {/* Pillar 4: Reduce */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isDark
            ? 'bg-zinc-900 border-zinc-800'
            : 'bg-white border-emerald-100 shadow-sm'
            }`}>
            <div className="w-12 h-12 bg-emerald-100 text-[#047857] rounded-xl flex items-center justify-center mb-5 font-bold shadow-inner">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="text-xs font-extrabold text-[#047857] uppercase tracking-wider mb-1">Pillar 4</div>
            <h3 className={`text-xl font-black mb-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>4. Target Reductions</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Execute community and enterprise challenges. Track lifestyle reductions toward recommended science-based targets.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> Cluster-Aware Verification
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
