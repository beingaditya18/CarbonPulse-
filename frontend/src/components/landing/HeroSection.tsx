import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onboardingComplete: boolean;
  isDark?: boolean;
}

/**
 * HeroSection handles the top landing page portal with problem descriptions,
 * environmental standard solution steps, average savings stats, and start CTA buttons.
 */
export function HeroSection({ onboardingComplete, isDark = false }: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-headline"
      className="hero-section text-left max-w-4xl mx-auto space-y-8"
    >
      {/* Environmental Standard Problem Banner */}
      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[#065f46] shadow-sm">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Statutory Benchmarking Mandate: SMC 22.920 Compliance Verified</span>
      </div>

      {/* Main Environmental Headline */}
      <h1 id="hero-headline" className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Transform Building Carbon From An Invisible Obligation Into <span className="text-[#047857]">Actionable Intelligence</span>.
      </h1>

      <p className={`text-base sm:text-lg leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-600'} max-w-2xl font-normal`}>
        Standard environmental emissions management powered by physics-calibrated machine learning and Explainable AI (TreeSHAP). Estimate, explain, and reduce emissions with complete regulatory trust.
      </p>

      {/* 4-Step Environmental Methodology Flow */}
      <ol
        aria-label="How CarbonPulse works"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2"
      >
        <li className={`p-4 rounded-2xl border transition-all hover:border-emerald-300 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#047857] flex items-center justify-center font-black text-xs">1</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Ingest</span>
          </div>
          <strong className={`block font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Track & Scan</strong>
          <span className={`text-xs mt-1 block leading-normal ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Upload utility receipts or audit structural building matrices.
          </span>
        </li>

        <li className={`p-4 rounded-2xl border transition-all hover:border-emerald-300 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#047857] flex items-center justify-center font-black text-xs">2</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">XAI</span>
          </div>
          <strong className={`block font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Explain Drivers</strong>
          <span className={`text-xs mt-1 block leading-normal ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            TreeSHAP breaks down floor area, vintage, and occupancy drivers.
          </span>
        </li>

        <li className={`p-4 rounded-2xl border transition-all hover:border-emerald-300 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#047857] flex items-center justify-center font-black text-xs">3</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Twin</span>
          </div>
          <strong className={`block font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Simulate Retros</strong>
          <span className={`text-xs mt-1 block leading-normal ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Forecast emissions impact under +5% GFA or HVAC retrofits.
          </span>
        </li>

        <li className={`p-4 rounded-2xl border transition-all hover:border-emerald-300 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#047857] flex items-center justify-center font-black text-xs">4</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Action</span>
          </div>
          <strong className={`block font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Quantify Cuts</strong>
          <span className={`text-xs mt-1 block leading-normal ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Log verifiable reductions with automated audit manifests.
          </span>
        </li>
      </ol>

      {/* Environmental Standard Proof Metrics */}
      <div
        aria-label="Platform impact statistics"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
        role="list"
      >
        <div role="listitem" className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
          <strong className="text-2xl sm:text-3xl font-black text-[#047857] block">36,730</strong>
          <span className={`text-xs font-semibold uppercase tracking-wider mt-0.5 block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Verified Filings Audited
          </span>
        </div>

        <div role="listitem" className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
          <strong className="text-2xl sm:text-3xl font-black text-[#047857] block">16.5%</strong>
          <span className={`text-xs font-semibold uppercase tracking-wider mt-0.5 block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Error Reduction vs Median
          </span>
        </div>

        <div role="listitem" className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'}`}>
          <strong className="text-2xl sm:text-3xl font-black text-[#047857] block">&lt; 0.009 g</strong>
          <span className={`text-xs font-semibold uppercase tracking-wider mt-0.5 block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Green AI Compute Footprint
          </span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
        <Link
          href={onboardingComplete ? "/dashboard" : "/calculator"}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#065f46] text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          aria-label="Start tracking your carbon footprint for free"
        >
          <span>{onboardingComplete ? 'Open Carbon Workspace' : 'Start Assessment Free'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <a
          href="#twin-preview"
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm border transition-all ${isDark
              ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-200'
              : 'border-emerald-200 bg-white hover:bg-emerald-50 text-[#047857]'
            }`}
        >
          <span>Explore Interactive Twin</span>
        </a>
      </div>
    </section>
  );
}
