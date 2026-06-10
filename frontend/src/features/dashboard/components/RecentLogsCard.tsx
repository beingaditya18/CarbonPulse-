'use client';

import { Car, Zap, Apple, ShoppingBag, Trash, Trash2 } from 'lucide-react';
import { CarbonLog, CategoryType } from '@/types/store';

interface RecentLogsCardProps {
  logs: CarbonLog[];
  onDeleteLog: (id: string) => void;
}

const CATEGORY_ICONS: Record<CategoryType, React.ReactNode> = {
  transportation: <Car className="w-4 h-4 text-blue-500" />,
  electricity: <Zap className="w-4 h-4 text-yellow-500" />,
  food: <Apple className="w-4 h-4 text-green-500" />,
  shopping: <ShoppingBag className="w-4 h-4 text-purple-500" />,
  waste: <Trash className="w-4 h-4 text-teal-500" />,
};

/**
 * RecentLogsCard displays the audit log history of logged manual or OCR carbon activities.
 */
export function RecentLogsCard({ logs, onDeleteLog }: RecentLogsCardProps) {
  return (
    <section className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Activity Logs History</h2>
          <p className="text-xs text-zinc-500 mt-1 font-semibold">Audit trail of manual & OCR entries</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
          <p className="text-zinc-500 text-sm">No emissions logged in this workspace yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 font-bold">
                <th className="pb-3 pl-2">Category</th>
                <th className="pb-3">Source</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Logged Date</th>
                <th className="pb-3 text-right pr-2">Amount</th>
                <th className="pb-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 10).map((log) => (
                <tr key={log.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/25 transition-colors">
                  <td className="py-3 pl-2 flex items-center gap-2 font-bold capitalize">
                    {CATEGORY_ICONS[log.category]}
                    <span>{log.category}</span>
                  </td>
                  <td className="py-3 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      log.source === 'ocr' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15' 
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                    }`}>
                      {log.source}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-400 truncate max-w-xs font-semibold">{log.description}</td>
                  <td className="py-3 text-zinc-500 text-xs font-semibold">
                    {new Date(log.logged_date).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-3 text-right font-extrabold text-zinc-200 pr-2">
                    {log.emission_amount} kg
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="text-red-500/80 hover:text-red-400 font-bold text-xs cursor-pointer flex items-center gap-1 mx-auto"
                      aria-label={`Delete ${log.category} log`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length > 10 && (
            <p className="text-xs text-center text-zinc-500 mt-4 font-semibold">
              Showing latest 10 logs. Reset database in settings to clear history.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
