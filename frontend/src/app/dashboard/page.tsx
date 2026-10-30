'use client';

import { useState, useEffect } from 'react';
import { useCarbonStore } from '@/store/useCarbonStore';
import { CategoryType } from '@/types/store';
import { useCarbonData } from '@/hooks/useCarbonData';
import { useReceiptUpload } from '@/hooks/useReceiptUpload';
import { useAIChat } from '@/hooks/useAIChat';
import { EmissionsSummary } from '@/components/dashboard/EmissionsSummary';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ChatCoachCard } from '@/features/dashboard/components/ChatCoachCard';
import { ManualLogDialog } from '@/features/dashboard/components/ManualLogDialog';
import { EmptyDashboard } from '@/components/feedback/EmptyDashboard';
import { TrendingDown, Check, Plus, Lightbulb, Leaf } from 'lucide-react';
import { getRecommendations } from '@/lib/tips-engine';

/**
 * DashboardPage is the central environmental command center for tracking, SHAP explanations, and AI climate coaching.
 * Styled with crisp white cards, rich green headers/accents, and clear data typography.
 */
export default function DashboardPage() {
  const {
    challenges,
    completeChallenge,
    acceptChallenge,
    clearChat,
    user,
  } = useCarbonStore();

  const [mounted, setMounted] = useState<boolean>(false);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);

  // Hook-managed states
  const {
    logs,
    addLog,
    deleteLog,
    currentEmissions,
    baseline,
    ratio,
    grade,
    gradeColor,
    shapData,
    chartData,
  } = useCarbonData();

  const {
    ocrScanStep,
    ocrFeedback,
    handleReceiptUpload,
    handleDemoScan,
  } = useReceiptUpload();

  const {
    chatHistory,
    chatInput,
    setChatInput,
    isCoachTyping,
    handleSendMessage,
  } = useAIChat();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const recommendations = user.calculatorAnswers
    ? getRecommendations(user.calculatorAnswers).slice(0, 3)
    : [];

  if (!mounted) return null;

  // Add Manual log entries
  const handleManualSubmit = (category: CategoryType, amount: number, description: string) => {
    addLog({
      category,
      emission_amount: amount,
      source: 'manual',
      description: description || `Manual ${category} entry`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── HEADER & WORKSPACE BANNER ────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#047857] border border-emerald-200 mb-2 uppercase tracking-wider">
            <Leaf className="w-3 h-3" /> SMC 22.920 Compliance Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Building & Footprint Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            Verified observational tracking, game-theoretic SHAP attributions, and real-time intervention forecasts.
          </p>
        </div>

        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-[#047857] hover:bg-[#065f46] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md self-start sm:self-center shrink-0"
          aria-label="Add manual carbon footprint log entry"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Log Activity
        </button>
      </header>

      {/* ── OCR RECEIPT UPLOADER CARD ────────────────────────────────────────────── */}
      <QuickActions
        ocrScanStep={ocrScanStep}
        ocrFeedback={ocrFeedback}
        onReceiptUpload={handleReceiptUpload}
        onDemoScan={handleDemoScan}
      />

      {/* ── MAIN DASHBOARD GRID ─────────────────────────────────────────────────── */}
      {logs.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Main Column: Gauge, Chart & Activity Table */}
          <div className="lg:col-span-8 space-y-8">
            <EmissionsSummary
              currentEmissions={currentEmissions}
              baseline={baseline}
              ratio={ratio}
              grade={grade}
              gradeColor={gradeColor}
              chartData={chartData}
            />

            {/* Attributions and Log Table */}
            <RecentActivity
              logs={logs}
              explanations={shapData.explanations}
              onDeleteLog={deleteLog}
            />
          </div>

          {/* Right Sidebar: Interventions, Tips & Climate Coach */}
          <aside className="lg:col-span-4 space-y-8">

            {/* Action Cards Checklist */}
            <section className="bg-white border border-slate-200/90 p-6 rounded-2xl space-y-5 shadow-xs relative overflow-hidden">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-[#047857] rounded-lg">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Priority Reduction Actions</h2>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-semibold uppercase tracking-wider">
                  Quantified Facility Challenges
                </p>
              </div>

              <div className="space-y-3">
                {challenges
                  .filter((c) => c.status !== 'completed')
                  .slice(0, 3)
                  .map((challenge) => (
                    <div
                      key={challenge.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-colors ${challenge.status === 'accepted'
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-slate-50/80 border-slate-200 hover:border-emerald-200'
                        }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                            {challenge.title}
                          </span>
                          <span className="text-[10px] shrink-0 uppercase tracking-wider font-extrabold text-[#047857] bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                            -{challenge.potential_impact} kg/mo
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">
                          {challenge.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 justify-end pt-1">
                        {challenge.status === 'accepted' ? (
                          <button
                            onClick={() => completeChallenge(challenge.id)}
                            className="bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <button
                            onClick={() => acceptChallenge(challenge.id)}
                            className="border border-slate-200 hover:border-emerald-500 bg-white text-slate-700 hover:text-[#047857] font-semibold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
                          >
                            Accept Action
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                {challenges.filter((c) => c.status !== 'completed').length === 0 && (
                  <div className="text-center py-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                    <Check className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-xs font-bold">All actions completed! High-efficiency tier achieved.</p>
                  </div>
                )}
              </div>
            </section>

            {/* AI Recommendations Card */}
            {recommendations.length > 0 && (
              <section className="bg-white border border-slate-200/90 p-6 rounded-2xl space-y-5 shadow-xs relative overflow-hidden">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Intervention Recommendations</h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold uppercase tracking-wider">
                    Derived from Baseline Matrix
                  </p>
                </div>

                <div className="space-y-3">
                  {recommendations.map((tip) => (
                    <div
                      key={tip.id}
                      className="p-3.5 rounded-xl border bg-slate-50 border-slate-200/80 flex flex-col justify-between gap-1.5"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">{tip.title}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200">
                          -{Math.round(tip.annualSavings)} kg/yr
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-normal font-medium">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Conversational AI Climate Coach */}
            <ChatCoachCard
              chatHistory={chatHistory}
              chatInput={chatInput}
              setChatInput={setChatInput}
              isCoachTyping={isCoachTyping}
              onSendMessage={handleSendMessage}
              onClearChat={clearChat}
            />

          </aside>

        </div>
      )}

      {/* ── POPUP LOG INPUT DIALOG ──────────────────────────────────────────────── */}
      <ManualLogDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleManualSubmit}
      />

    </div>
  );
}
