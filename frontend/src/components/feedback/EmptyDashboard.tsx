/**
 * EmptyDashboard is rendered on the dashboard layout when no logs are found.
 */
export function EmptyDashboard() {
  return (
    <section
      aria-label="No emissions data yet"
      className="empty-state text-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 max-w-lg mx-auto"
    >
      <span aria-hidden="true" className="text-6xl block">
        🌱
      </span>
      <h2 className="text-xl font-bold text-zinc-200">Your climate journey starts here.</h2>
      <p className="text-sm text-zinc-400 leading-relaxed font-semibold">
        The average person emits 4–8 tonnes of CO₂ per year. Most don&apos;t know where it comes from. You&apos;re about to find out.
      </p>
      <div className="empty-actions flex justify-center gap-4 pt-2">
        <a
          href="/dashboard"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
          aria-label="Scan your first receipt"
        >
          📷 Scan a Receipt
        </a>
        <a
          href="/onboarding"
          className="border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
          aria-label="Log your first activity"
        >
          ✏️ Log an Activity
        </a>
      </div>
    </section>
  );
}
