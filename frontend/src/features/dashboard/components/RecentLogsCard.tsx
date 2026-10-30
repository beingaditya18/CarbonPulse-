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
    <section className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-6 rounded-2xl shadow-xs space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity Logs History</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Environmental audit trail of verified manual & OCR consumption entries</p>
        </div>
        <span className="text-xs font-bold text-[#047857] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
          {logs.length} Total Records
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950/50">
          <p className="text-slate-500 dark:text-zinc-500 text-sm font-medium">No emissions logged in this workspace yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
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
                <tr key={log.id} className="border-b border-slate-100 dark:border-zinc-800/60 hover:bg-emerald-50/40 dark:hover:bg-zinc-800/25 transition-colors">
                  <td className="py-3.5 pl-2 flex items-center gap-2 font-bold capitalize text-slate-900 dark:text-zinc-100">
                    {CATEGORY_ICONS[log.category]}
                    <span>{log.category}</span>
                  </td>
                  <td className="py-3.5 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      log.source === 'ocr' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' 
                        : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                    }`}>
                      {log.source}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-600 dark:text-zinc-400 truncate max-w-xs font-medium">{log.description}</td>
                  <td className="py-3.5 text-slate-500 dark:text-zinc-500 text-xs font-medium">
                    {new Date(log.logged_date).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-3.5 text-right font-extrabold text-slate-900 dark:text-zinc-100 pr-2">
                    {log.emission_amount} kg
                  </td>
                  <td className="py-3.5 text-center">
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-red-400 dark:hover:bg-red-950/30 px-2 py-1 rounded-md font-semibold text-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
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
            <p className="text-xs text-center text-slate-500 dark:text-zinc-500 mt-4 font-medium">
              Showing latest 10 logs. Reset database in settings to clear history.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
