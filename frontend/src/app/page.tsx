'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCarbonStore } from '@/store/useCarbonStore';
import { Leaf, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { ImpactStats } from '@/components/landing/ImpactStats';
import { PreviewSimulator } from '@/components/landing/PreviewSimulator';

/**
 * LandingPage component serving as the CarbonPulse AI+ homepage.
 * Built to environmental standard website aesthetics: authoritative forest green header,
 * clean white background, fresh eco-green badges, and high-contrast typography.
 */
export default function LandingPage() {
  const { user } = useCarbonStore();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDarkClass = document.documentElement.classList.contains('dark');
    setIsDark(isDarkClass);
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

  const isOnboarded = mounted ? Boolean(user?.onboardingComplete) : false;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-slate-900'}`}>

      {/* ── TOP ENVIRONMENTAL UTILITY BANNER ────────────────────────────────────────── */}
      <div className="bg-[#064e3b] text-emerald-100 text-xs py-2 px-6 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
              Standard Environmental Platform
            </span>
            <span>Science-based GHG emissions accounting • Seattle Benchmarking verified (SMC 22.920)</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-emerald-200/80 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              EPA Portfolio Manager Aligned
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              ISO 14064 Standard
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN ENVIRONMENTAL GREEN HEADER NAVBAR ──────────────────────────────────── */}
      <header className="bg-[#047857] text-white px-6 py-4 sticky top-0 z-50 shadow-md border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Brand Logo & Environmental Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-white text-[#047857] rounded-xl shadow-sm transition-transform group-hover:scale-105">
              <Leaf className="w-6 h-6 fill-[#047857]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  CarbonPulse <span className="text-emerald-200">AI+</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-100 border border-emerald-600/50 uppercase tracking-wider">
                  Eco Verified
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90 font-medium tracking-wide hidden sm:block">
                Sustainable Building & Climate Emissions Intelligence
              </p>
            </div>
          </Link>

          {/* Environmental Navigation & Actions */}
          <nav className="flex items-center gap-3 sm:gap-6" aria-label="Main Navigation">
            <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-emerald-50">
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#twin-preview" className="hover:text-white transition-colors">Simulation</a>
              <a href="#features" className="hover:text-white transition-colors">Explainability</a>
              <a href="#standards" className="hover:text-white transition-colors">Compliance</a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-emerald-800/80 hover:bg-emerald-900 text-emerald-100 border border-emerald-700/60 transition-colors"
                aria-label="Toggle display mode"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <Link
                href={isOnboarded ? "/dashboard" : "/calculator"}
                className="bg-white hover:bg-emerald-50 text-[#047857] px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-1.5 border border-white hover:border-emerald-100"
              >
                {isOnboarded ? 'Access Workspace' : 'Start Assessment'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ── HERO & SIMULATOR GRID (WHITE BACKGROUND CANVAS) ─────────────────────────── */}
      <div className={`${isDark ? 'bg-zinc-950' : 'bg-gradient-to-b from-emerald-50/40 via-white to-white'}`}>
        <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <HeroSection onboardingComplete={isOnboarded} isDark={isDark} />
          </div>
          <PreviewSimulator isDark={isDark} />
        </main>
      </div>

      {/* ── CORE FEATURES GRID (TRACK -> EXPLAIN -> SIMULATE -> REDUCE) ─────────────── */}
      <div id="how-it-works">
        <FeaturesGrid isDark={isDark} />
      </div>

      {/* ── ENVIRONMENTAL STANDARDS & COMPLIANCE PANEL ─────────────────────────────── */}
      <div id="standards">
        <ImpactStats isDark={isDark} />
      </div>

      {/* ── ENVIRONMENTAL FOOTER ────────────────────────────────────────────────────── */}
      <footer className={`${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-[#064e3b] text-emerald-100'} py-16 border-t border-emerald-900`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-lg text-[#047857]">
                  <Leaf className="w-5 h-5 fill-[#047857]" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">CarbonPulse AI+</span>
              </div>
              <p className="text-sm text-emerald-200/80 max-w-md leading-relaxed">
                Empowering organizations, facility managers, and citizens with trustworthy Explainable AI (TreeSHAP, EBM) and Digital Twins for verified carbon emissions accounting.
              </p>
              <div className="flex items-center gap-3 text-xs text-emerald-300 font-semibold">
                <span className="px-2.5 py-1 rounded-md bg-emerald-900/80 border border-emerald-700/60">Seattle SMC 22.920 Compliant</span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-900/80 border border-emerald-700/60">GHG Protocol Scope 1-3</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Methodology</h4>
              <ul className="space-y-2.5 text-xs text-emerald-200/80">
                <li><Link href="/calculator" className="hover:text-white transition-colors">Building Emissions Calculator</Link></li>
                <li><Link href="/dashboard/twin" className="hover:text-white transition-colors">Digital Twin Simulation</Link></li>
                <li><Link href="/dashboard/insights" className="hover:text-white transition-colors">Explainable AI (SHAP)</Link></li>
                <li><Link href="/dashboard/community" className="hover:text-white transition-colors">Community Eco Actions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Standards & Trust</h4>
              <ul className="space-y-2.5 text-xs text-emerald-200/80">
                <li><span className="text-white font-semibold">EPA ENERGY STAR</span> Factor Calibration</li>
                <li><span className="text-white font-semibold">City of Seattle OSE</span> Open Data</li>
                <li><span className="text-white font-semibold">ISO 14064-1</span> Boundary Principles</li>
                <li><span className="text-white font-semibold">Zero Synthetic Injection</span> Verified</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-emerald-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/70">
            <p>© {new Date().getFullYear()} CarbonPulse AI+. Dedicated to standard environmental transparency & climate action.</p>
            <div className="flex gap-6 font-medium">
              <a href="#" className="hover:text-white transition-colors">Environmental Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Open Data Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Security Verification</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
