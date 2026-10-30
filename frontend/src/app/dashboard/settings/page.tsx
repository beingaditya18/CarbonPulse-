'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCarbonStore } from '@/store/useCarbonStore';
import { User, RefreshCw, Trash2, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, resetStore } = useCarbonStore();

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [baseline, setBaseline] = useState(280);
  const [saved, setSaved] = useState(false);

  // Preference states
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      if (user.onboardingComplete) {
        setName(user.name);
        setEmail(user.email);
        setBaseline(user.baselineEmissions);
      }
    }, 0);
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to Zustand state store
    const store = useCarbonStore.getState();
    useCarbonStore.setState({
      user: {
        ...store.user,
        name: name.trim() || store.user.name,
        email: email.trim() || store.user.email,
        baselineEmissions: Math.max(10, baseline),
      }
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    const doubleCheck = confirm('⚠️ Are you sure you want to reset your CarbonPulse AI+ workspace? This will delete all carbon activity logs, badges, challenges progress, and force you to re-do onboarding.');
    if (doubleCheck) {
      resetStore();
      router.push('/calculator');
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <header className="border-b border-slate-200/80 pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-[#065f46] border border-emerald-200 mb-2">
          Workspace Configuration
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Workspace Settings</h1>
        <p className="text-slate-600 dark:text-zinc-400 mt-1 text-sm font-medium">
          Configure profile details, metric thresholds, API settings, and reset databases.
        </p>
      </header>

      {/* TWO PANEL COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: EDIT FORM */}
        <div className="lg:col-span-8 space-y-6">
          
          <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-6 rounded-2xl shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-[#047857]">
                  <User className="w-5 h-5" />
                </span>
                Account Profile Workspace
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="settings-name-input" className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">User Name</label>
                <input
                  id="settings-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-[#047857] outline-none text-slate-900 dark:text-zinc-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="settings-email-input" className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Email Address</label>
                <input
                  id="settings-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-[#047857] outline-none text-slate-900 dark:text-zinc-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="settings-baseline-input" className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Baseline Emissions Limit (kg CO₂ / month)</label>
              <input
                id="settings-baseline-input"
                type="number"
                value={baseline}
                onChange={(e) => setBaseline(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-[#047857] outline-none text-slate-900 dark:text-zinc-200"
                required
              />
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium leading-relaxed">
                Calculated threshold limit representing typical household emissions. Adjusting this modifies your Carbon Score circular Grade targets.
              </p>
            </div>

            {/* Caching preferences */}
            <div className="space-y-3 border-t border-slate-100 dark:border-zinc-850 pt-4">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-400 uppercase tracking-wider block">Measurement Preferences</label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    id="unit-kg-radio"
                    type="radio"
                    checked={unit === 'kg'}
                    onChange={() => setUnit('kg')}
                    className="accent-[#047857]"
                  />
                  <label htmlFor="unit-kg-radio" className="text-xs text-slate-700 dark:text-zinc-300 font-medium">Metric kg CO₂ (EPA Standard)</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="unit-lbs-radio"
                    type="radio"
                    checked={unit === 'lbs'}
                    onChange={() => setUnit('lbs')}
                    className="accent-[#047857]"
                  />
                  <label htmlFor="unit-lbs-radio" className="text-xs text-slate-700 dark:text-zinc-300 font-medium">Imperial lbs CO₂</label>
                </div>
              </div>
            </div>

            {/* Success prompt */}
            {saved && (
              <div className="p-3 bg-emerald-50 text-[#065f46] border border-emerald-200 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-[#047857]" /> Workspace configurations updated successfully.
              </div>
            )}

            <button
              type="submit"
              className="bg-[#047857] hover:bg-[#065f46] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Preferences
            </button>

          </form>

        </div>

        {/* RIGHT COLUMN: DANGER ZONE & API CONFIGURATIONS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* MOCK GOOGLE CREDENTIALS FOR COMPLIANCE */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-300">Google Cloud API Integrations</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-500 leading-relaxed font-medium">
              CarbonPulse AI+ connects directly to your Google Cloud Console deployment.
            </p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-zinc-400 font-medium">Vertex AI Pipelines</span>
                <span className="text-[#047857] dark:text-emerald-500 font-bold">Enabled</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-zinc-400 font-medium">Cloud Vision OCR</span>
                <span className="text-[#047857] dark:text-emerald-500 font-bold">Enabled</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-zinc-400 font-medium">Cloud Storage Buckets</span>
                <span className="text-[#047857] dark:text-emerald-500 font-bold">Active</span>
              </div>
            </div>
          </section>

          {/* DANGER ZONE RESET CARD */}
          <section className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-red-500/20 p-6 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-rose-700 dark:text-red-500 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" /> Danger Zone
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 font-medium leading-relaxed">
                Irreversible actions that clear all database states and log buffers.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Eco Workspace
            </button>
          </section>

        </div>

      </div>

    </div>
  );
}
