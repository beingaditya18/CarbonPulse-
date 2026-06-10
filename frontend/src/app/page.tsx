'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCarbonStore } from '@/store/useCarbonStore';
import { Leaf, ArrowRight } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { ImpactStats } from '@/components/landing/ImpactStats';
import { PreviewSimulator } from '@/components/landing/PreviewSimulator';

/**
 * LandingPage component serving as the CarbonPulse AI+ homepage marketing portal.
 * Integrates modular sections and supports dark/light mode toggles.
 */
export default function LandingPage() {
  const { user } = useCarbonStore();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const isDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(isDarkClass);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-zinc-900'}`}>
      
      {/* HEADER NAVBAR */}
      <header className="border-b border-zinc-200/20 px-6 py-4 flex items-center justify-between sticky top-0 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            CarbonPulse AI+
          </span>
        </div>
        <nav className="flex items-center gap-4" aria-label="Main Navigation">
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-colors ${isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'}`}
            aria-label="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <Link
            href={user.onboardingComplete ? "/dashboard" : "/onboarding"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-md flex items-center gap-1"
          >
            {user.onboardingComplete ? 'Dashboard' : 'Get Started'} <ArrowRight className="w-4 h-4" />
          </Link>
        </nav>
      </header>

      {/* HERO & SIMULATOR GRID */}
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <HeroSection onboardingComplete={user.onboardingComplete} />
        </div>
        <PreviewSimulator isDark={isDark} />
      </main>

      {/* HACKATHON FEATURE MATRIX */}
      <FeaturesGrid isDark={isDark} />

      {/* SECURITY / TRUST PANEL */}
      <ImpactStats isDark={isDark} />

      {/* FOOTER */}
      <footer className="border-t border-zinc-200/10 py-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CarbonPulse AI+. Dedicated to intelligent climate action.</p>
          <div className="flex gap-4 font-semibold text-zinc-400">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:underline">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:underline">Google Cloud Console</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
