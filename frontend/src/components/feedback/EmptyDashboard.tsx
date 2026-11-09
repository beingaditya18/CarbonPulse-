/**
 * EmptyDashboard is rendered on the dashboard layout when no logs are found.
 */
export function EmptyDashboard() {
  return (
    <section
      aria-label="No emissions data yet"
      className="empty-state text-center p-8 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4 max-w-lg mx-auto"
    >
      <span aria-hidden="true" className="text-6xl block">
        🌱
      </span>
      <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Your climate journey starts here.</h2>
      <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
        The average person emits 4–8 tonnes of CO₂ per year. Most don&apos;t know where it comes from. You&apos;re about to find out.
      </p>
      <div className="empty-actions flex justify-center gap-4 pt-2">
        <a
          href="/dashboard"
          className="bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
          aria-label="Scan your first receipt"
        >
          📷 Scan a Receipt
        </a>
        <a
          href="/calculator"
          className="border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
          aria-label="Log your first activity"
        >
          ✏️ Log an Activity
        </a>
      </div>
    </section>
  );
}
