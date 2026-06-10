import Link from 'next/link';

/**
 * HeroSection handles the top landing page portal with problem descriptions,
 * solution features lists, average savings stats, and start CTA buttons.
 */
export function HeroSection({ onboardingComplete }: { onboardingComplete: boolean }) {
  return (
    <section
      aria-labelledby="hero-headline"
      className="hero-section text-center max-w-4xl mx-auto space-y-8 py-16 lg:py-24"
    >
      {/* Problem — first thing user reads */}
      <p
        className="problem-statement text-emerald-500 font-extrabold text-lg uppercase tracking-wider bg-emerald-500/10 inline-block px-4 py-1.5 rounded-full"
        aria-label="The problem we solve"
      >
        🌍 Carbon emissions are invisible. Most people have no idea what their daily choices cost the planet.
      </p>

      {/* Solution — second thing */}
      <h1 id="hero-headline" className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
        CarbonPulse AI+ makes your carbon footprint <span className="text-emerald-500">visible</span>, <span className="text-emerald-500">explainable</span>, and <span className="text-emerald-500">reducible</span>.
      </h1>

      {/* Impact flow — third thing */}
      <ol
        aria-label="How CarbonPulse works"
        className="impact-flow grid grid-cols-1 md:grid-cols-4 gap-6 text-left pt-6"
      >
        <li className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl">
          <strong className="text-emerald-400 block text-lg font-bold">1. Track</strong>
          <span className="text-sm text-zinc-400 font-medium mt-1 block">Scan receipts. Log activities.</span>
        </li>
        <li className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl">
          <strong className="text-emerald-400 block text-lg font-bold">2. Explain</strong>
          <span className="text-sm text-zinc-400 font-medium mt-1 block">AI shows exactly which habits drive your emissions.</span>
        </li>
        <li className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl">
          <strong className="text-emerald-400 block text-lg font-bold">3. Simulate</strong>
          <span className="text-sm text-zinc-400 font-medium mt-1 block">Model future impact of lifestyle changes.</span>
        </li>
        <li className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl">
          <strong className="text-emerald-400 block text-lg font-bold">4. Reduce</strong>
          <span className="text-sm text-zinc-400 font-medium mt-1 block">Take targeted action with quantified results.</span>
        </li>
      </ol>

      {/* Proof — impact numbers */}
      <div
        aria-label="Platform impact statistics"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6"
        role="list"
      >
        <div role="listitem" className="p-4 bg-zinc-900/20 border border-zinc-800/45 rounded-xl">
          <strong className="text-3xl font-extrabold text-emerald-500 block">2.4 tonnes</strong>
          <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider mt-1 block">avg CO₂ tracked per user</span>
        </div>
        <div role="listitem" className="p-4 bg-zinc-900/20 border border-zinc-800/45 rounded-xl">
          <strong className="text-3xl font-extrabold text-emerald-500 block">340 kg</strong>
          <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider mt-1 block">avg CO₂ saved per user</span>
        </div>
        <div role="listitem" className="p-4 bg-zinc-900/20 border border-zinc-800/45 rounded-xl">
          <strong className="text-3xl font-extrabold text-emerald-500 block">1 tree</strong>
          <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider mt-1 block">planted per 22 kg saved</span>
        </div>
      </div>

      <div className="pt-6">
        <Link
          href={onboardingComplete ? "/dashboard" : "/onboarding"}
          className="cta-button inline-flex bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-0.5"
          aria-label="Start tracking your carbon footprint for free"
        >
          Start Tracking Free →
        </Link>
      </div>
    </section>
  );
}
