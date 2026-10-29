/**
 * EmptyTwin is rendered on the Digital Twin page when historical carbon logs are insufficient.
 */
export function EmptyTwin() {
  return (
    <section
      aria-label="No twin data available"
      className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 max-w-lg mx-auto"
    >
      <h2 className="text-xl font-bold text-zinc-205">Build your Digital Carbon Twin</h2>
      <p className="text-sm text-zinc-400 leading-relaxed font-semibold">
        Log at least 7 days of activity to unlock your personal emissions forecast. Your twin will project what happens if you drive 20% less, switch to plant-based meals, or reduce home energy use.
      </p>
      <a
        href="/dashboard"
        className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md mt-2 animate-pulse"
      >
        Start Logging →
      </a>
    </section>
  );
}
