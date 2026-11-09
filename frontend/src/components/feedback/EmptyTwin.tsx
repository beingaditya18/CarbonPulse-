/**
 * EmptyTwin is rendered on the Digital Twin page when historical carbon logs are insufficient.
 */
export function EmptyTwin() {
  return (
    <section
      aria-label="No twin data available"
      className="text-center p-8 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4 max-w-lg mx-auto"
    >
      <span aria-hidden="true" className="text-5xl block">
        🌿
      </span>
      <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Build your Digital Carbon Twin</h2>
      <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
        Log at least 7 days of activity to unlock your personal emissions forecast. Your twin will project what happens if you drive 20% less, switch to plant-based meals, or reduce home energy use.
      </p>
      <a
        href="/dashboard"
        className="inline-block bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs mt-2"
      >
        Start Logging →
      </a>
    </section>
  );
}
