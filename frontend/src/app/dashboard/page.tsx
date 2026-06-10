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
import { TrendingDown, Check, Plus } from 'lucide-react';

/**
 * DashboardPage is the central command center for tracking, SHAP explanations, and AI coach.
 */
export default function DashboardPage() {
  const {
    challenges,
    completeChallenge,
    acceptChallenge,
    clearChat,
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
      
      {/* HEADER BAR */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Eco Dashboard</h1>
          <p className="text-zinc-500 mt-1">
            Track, explain, and manage your localized carbon emissions.
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-zinc-100 hover:bg-white text-zinc-950 px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          aria-label="Add manual carbon footprint log entry"
        >
          <Plus className="w-4 h-4" /> Log Manual
        </button>
      </header>

      {/* OCR UPLOADER CARD */}
      <QuickActions
        ocrScanStep={ocrScanStep}
        ocrFeedback={ocrFeedback}
        onReceiptUpload={handleReceiptUpload}
        onDemoScan={handleDemoScan}
      />

      {/* GRID OVERVIEW */}
      {logs.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left main grids */}
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

          {/* Right sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Action cards checklist */}
            <section className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-1.5">
                  <TrendingDown className="w-5 h-5 text-emerald-500" /> Next Reduction Actions
                </h2>
                <p className="text-xs text-zinc-500 mt-1 font-semibold uppercase tracking-wider">What to do next</p>
              </div>

              <div className="space-y-3">
                {challenges
                  .filter((c) => c.status !== 'completed')
                  .slice(0, 3)
                  .map((challenge) => (
                    <div 
                      key={challenge.id} 
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors ${
                        challenge.status === 'accepted' 
                          ? 'bg-emerald-500/5 border-emerald-500/20' 
                          : 'bg-zinc-950 border-zinc-800/80'
                       }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-sm text-zinc-200 leading-tight">{challenge.title}</span>
                          <span className="text-[10px] shrink-0 uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            -{challenge.potential_impact} kg/mo
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-semibold">{challenge.description}</p>
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        {challenge.status === 'accepted' ? (
                          <button
                            onClick={() => completeChallenge(challenge.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md cursor-pointer"
                          >
                            Complete Challenge
                          </button>
                        ) : (
                          <button
                            onClick={() => acceptChallenge(challenge.id)}
                            className="border border-zinc-805 hover:border-zinc-700 text-zinc-400 hover:text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Accept Challenge
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                {challenges.filter((c) => c.status !== 'completed').length === 0 && (
                  <div className="text-center py-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                    <Check className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs text-emerald-400 font-bold">All challenges conquerered! Check achievements vault.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Conversations assistant */}
            <ChatCoachCard
              chatHistory={chatHistory}
              chatInput={chatInput}
              setChatInput={setChatInput}
              isCoachTyping={isCoachTyping}
              onSendMessage={handleSendMessage}
              onClearChat={clearChat}
            />
          </aside>

        </main>
      )}

      {/* POPUP LOG INPUT DIALOG */}
      <ManualLogDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleManualSubmit}
      />

    </div>
  );
}
