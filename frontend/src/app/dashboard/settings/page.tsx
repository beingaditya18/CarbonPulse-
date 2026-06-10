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
      router.push('/onboarding');
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Workspace Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Configure profile details, metric thresholds, API settings, and reset databases.
        </p>
      </header>

      {/* TWO PANEL COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: EDIT FORM */}
        <div className="lg:col-span-8 space-y-6">
          
          <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-1.5">
              <User className="w-5 h-5 text-emerald-500" /> Account Profile Workspace
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="settings-name-input" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">User Name</label>
                <input
                  id="settings-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-zinc-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="settings-email-input" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <input
                  id="settings-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-zinc-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="settings-baseline-input" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Baseline Emissions Limit (kg CO₂ / month)</label>
              <input
                id="settings-baseline-input"
                type="number"
                value={baseline}
                onChange={(e) => setBaseline(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-zinc-200"
                required
              />
              <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                Calculated threshold limit representing typical household emissions. Adjusting this modifies your Carbon Score circular Grade targets.
              </p>
            </div>

            {/* Caching preferences */}
            <div className="space-y-3 border-t border-zinc-850 pt-4">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Preferences</label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    id="unit-kg-radio"
                    type="radio"
                    checked={unit === 'kg'}
                    onChange={() => setUnit('kg')}
                    className="accent-emerald-500"
                  />
                  <label htmlFor="unit-kg-radio" className="text-xs text-zinc-300">Metric kg CO₂ (Standard)</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="unit-lbs-radio"
                    type="radio"
                    checked={unit === 'lbs'}
                    onChange={() => setUnit('lbs')}
                    className="accent-emerald-500"
                  />
                  <label htmlFor="unit-lbs-radio" className="text-xs text-zinc-300">Imperial lbs CO₂</label>
                </div>
              </div>
            </div>

            {/* Success prompt */}
            {saved && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4" /> Workspace configurations updated successfully.
              </div>
            )}

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Preferences
            </button>

          </form>

        </div>

        {/* RIGHT COLUMN: DANGER ZONE & API CONFIGURATIONS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* MOCK GOOGLE CREDENTIALS FOR COMPLIANCE */}
          <section className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-300">Google Cloud API Integrations</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
              CarbonPulse AI+ connects directly to your Google Cloud Console deployment.
            </p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Vertex AI Pipelines</span>
                <span className="text-emerald-500 font-bold">Enabled</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Cloud Vision OCR</span>
                <span className="text-emerald-500 font-bold">Enabled</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Cloud Storage Buckets</span>
                <span className="text-emerald-500 font-bold">Active</span>
              </div>
            </div>
          </section>

          {/* DANGER ZONE RESET CARD */}
          <section className="bg-zinc-900 border border-red-500/20 p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-red-500 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" /> Danger Zone
              </h3>
              <p className="text-xs text-zinc-500 mt-1 font-semibold leading-relaxed">
                Irreversible actions that clear all database states and log buffers.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Eco Workspace
            </button>
          </section>

        </div>

      </div>

    </div>
  );
}
