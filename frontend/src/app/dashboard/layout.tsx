'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCarbonStore } from '@/store/useCarbonStore';
import {
  Leaf,
  Activity,
  Trophy,
  Settings,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Loader2,
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/dashboard', label: '1. Track & Scan', Icon: Activity, desc: 'Utility bills & direct activity' },
  { href: '/dashboard/insights', label: '2. Explain (SHAP)', Icon: Sparkles, desc: 'Additive feature drivers' },
  { href: '/dashboard/twin', label: '3. Digital Twin', Icon: Leaf, desc: 'Forecast retrofit scenarios' },
  { href: '/dashboard/community', label: '4. Eco Action Vault', Icon: Trophy, desc: 'Target reductions & badges' },
] as const;

/**
 * DashboardLayout renders the environmental standard management workspace.
 * Features an authoritative green header, clean white sidebar, and airy light content canvas.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useCarbonStore();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!mounted) return null;

  if (!user.onboardingComplete) {
    router.replace('/calculator');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center text-slate-700">
        <div className="space-y-4 bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl max-w-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#047857] mx-auto" />
          <p className="text-sm font-semibold">Configuring carbon workspace pipelines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-[#f8fafc] text-slate-900'}`}>

      {/* ── SKIP TO MAIN CONTENT ────────────────────────────────────────── */}
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#047857] text-white px-4 py-2 rounded-xl z-50 font-medium text-xs border border-emerald-400"
      >
        Skip to main content
      </a>

      {/* ── MOBILE ENVIRONMENTAL GREEN HEADER BAR ─────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-[#047857] text-white fixed top-0 left-0 right-0 z-40 shadow-sm border-b border-emerald-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white text-[#047857] rounded-lg">
            <Leaf className="h-5 w-5 fill-[#047857]" />
          </div>
          <span className="text-base font-black text-white">
            CarbonPulse <span className="text-emerald-200">AI+</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-emerald-800 text-emerald-100 border border-emerald-700 text-xs"
            aria-label="Toggle display mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-emerald-800 text-white border border-emerald-700"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ── ENVIRONMENTAL NAVIGATION SIDEBAR ───────────────────────────────── */}
      <aside
        className={[
          'fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-10 w-64 border-r p-5 flex flex-col transition-transform duration-300 md:translate-x-0 h-screen',
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
            : 'bg-white border-slate-200 text-slate-900 shadow-xs',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Brand Logo & Environmental Identifier */}
        <div className="flex items-center gap-2.5 mb-8 px-2 justify-between">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <div className="p-1.5 bg-[#047857] text-white rounded-xl shadow-xs">
              <Leaf className="h-5 w-5 fill-white" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#047857]">
                CarbonPulse <span className="text-emerald-500">AI+</span>
              </span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Eco Workspace
              </p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav aria-label="CarbonPulse navigation" className="flex-1 space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 px-3 pb-2">
            Audit Lifecycle
          </div>
          <ol className="space-y-1.5">
            {NAV_LINKS.map(({ href, label, Icon, desc }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={[
                      'flex items-start gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs leading-normal',
                      isActive
                        ? isDark
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 font-bold'
                          : 'bg-emerald-50 text-[#047857] border border-emerald-200 font-bold shadow-xs'
                        : isDark
                          ? 'hover:bg-zinc-800 text-zinc-400 border border-transparent'
                          : 'hover:bg-slate-50 text-slate-600 hover:text-[#047857] border border-transparent',
                    ].join(' ')}
                  >
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isActive ? 'text-[#047857]' : 'text-slate-400'}`} aria-hidden="true" />
                    <div>
                      <span className="block">{label}</span>
                      <span className={`text-[10px] block font-normal ${isActive ? 'text-emerald-700/80' : 'text-slate-400'}`}>
                        {desc}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* User quick status & actions */}
        <div className={`border-t pt-4 mt-auto space-y-3 ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-emerald-50/50 border-emerald-100'
            }`}>
            <div className="w-9 h-9 rounded-full bg-[#047857] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                <span>LVL {user.ecoLevel}</span>
                <span>•</span>
                <span>{user.points} XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Link
              href="/dashboard/settings"
              onClick={() => setSidebarOpen(false)}
              className={`p-2 rounded-lg border flex-1 text-center font-bold text-xs flex justify-center items-center gap-1.5 transition-all ${isDark
                  ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-white'
                }`}
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" /> Settings
            </Link>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg border flex justify-center items-center transition-all ${isDark
                  ? 'border-zinc-800 text-zinc-400 hover:bg-red-950/40 hover:text-red-400'
                  : 'border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 bg-white'
                }`}
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT CONTAINER WITH GREEN DESKTOP HEADER ───────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden pt-[56px] md:pt-0">

        {/* Desktop Top Environmental Green Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-[#047857] text-white shadow-sm border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-200" />
              <span className="text-xs uppercase tracking-wider font-extrabold text-white">
                Seattle Municipal Benchmarking Workspace
              </span>
            </div>
            <span className="text-emerald-300">•</span>
            <span className="text-xs font-semibold text-emerald-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> SMC 22.920 Statutory Model Active
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 bg-white text-[#047857] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Level {user.ecoLevel} ({user.points} XP)
            </div>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-900 text-emerald-100 border border-emerald-700/60 transition-colors"
              aria-label="Toggle display mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Dashboard inner panels container */}
        <main
          id="dashboard-content"
          className="flex-1 p-6 md:p-8 outline-none max-w-7xl w-full mx-auto"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

    </div>
  );
}
