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
  Sparkles
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Track', Icon: Activity, step: '1', ariaLabel: 'Step 1: Track your emissions' },
  { href: '/dashboard/insights', label: 'Explain', Icon: Sparkles, step: '2', ariaLabel: 'Step 2: Understand your footprint' },
  { href: '/dashboard/twin', label: 'Simulate', Icon: Leaf, step: '3', ariaLabel: 'Step 3: Simulate lifestyle changes' },
  { href: '/dashboard/community', label: 'Reduce', Icon: Trophy, step: '4', ariaLabel: 'Step 4: Reduce and earn rewards' },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useCarbonStore();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      // Read dark mode state
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

  // Redirection guard: if onboarding isn't complete, force onboarding!
  if (!user.onboardingComplete) {
    router.replace('/onboarding');
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center text-zinc-300">
        <div className="space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
          <p className="text-sm">Configuring carbon workspace pipelines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-zinc-900'}`}>
      
      {/* ── SKIP TO MAIN CONTENT ────────────────────────────────────────── */}
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded-xl z-50 font-medium text-xs border border-emerald-500/25"
      >
        Skip to main content
      </a>

      {/* ── MOBILE HEADER / BOTTOM NAVIGATION ─────────────────────────────── */}
      <div className={`md:hidden flex items-center justify-between px-6 py-4 border-b fixed top-0 left-0 right-0 z-40 backdrop-blur-md ${isDark ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-white/80 border-zinc-200'}`}>
        <div className="flex items-center gap-2">
          <Leaf className="text-emerald-500 h-6 w-6" />
          <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            CarbonPulse AI+
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border text-xs ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-600'}`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg border ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-600'}`}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Overlay when open) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ── NAVIGATION SIDEBAR (DESKTOP & MOBILE MENU DRAWER) ──────────────── */}
      <aside
        className={[
          'fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-10 w-64 border-r p-5 flex flex-col transition-transform duration-300 md:translate-x-0 h-screen',
          isDark 
            ? 'bg-zinc-900 border-zinc-800/80 text-zinc-200' 
            : 'bg-white border-zinc-200 text-zinc-900',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-8 px-2 justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <Leaf className="text-emerald-500 h-7 w-7" />
            <span className="text-lg font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              CarbonPulse AI+
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary nav links */}
        <nav aria-label="CarbonPulse main navigation" className="flex-1">
          <ol aria-label="Your sustainability journey" className="space-y-1.5">
            {NAV_LINKS.map(({ href, label, Icon, step, ariaLabel }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={ariaLabel}
                    className={[
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm',
                      'outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isDark
                          ? 'hover:bg-zinc-800/60 text-zinc-400 border border-transparent'
                          : 'hover:bg-zinc-100 text-zinc-600 border border-transparent',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-zinc-950/60 text-zinc-500 font-bold text-[10px] rounded-full border border-zinc-805/80 mr-1 shrink-0" aria-hidden="true">
                        {step}
                      </span>
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{label}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Footer info: User quick status */}
        <div className="border-t border-zinc-200/10 pt-4 mt-auto space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                <span>LVL {user.ecoLevel}</span>
                <span>•</span>
                <span className="text-emerald-500">{user.points} PTS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Link
              href="/dashboard/settings"
              onClick={() => setSidebarOpen(false)}
              className={`p-2.5 rounded-lg border flex-1 text-center font-bold text-xs flex justify-center items-center gap-1.5 transition-all ${isDark ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-800/50 hover:text-white' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </Link>
            <button
              onClick={handleLogout}
              className={`p-2.5 rounded-lg border flex justify-center items-center transition-all ${isDark ? 'border-zinc-800 text-zinc-500 hover:bg-red-500/10 hover:text-red-400' : 'border-zinc-200 text-zinc-500 hover:bg-red-100 hover:text-red-600'}`}
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT CONTAINER ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden pt-[72px] md:pt-0">
        
        {/* Desktop Top Header Bar */}
        <header className={`hidden md:flex items-center justify-between px-8 py-4 border-b transition-all ${isDark ? 'bg-zinc-950/40 border-zinc-800/80' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs uppercase tracking-wider font-extrabold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Enterprise workspace
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs font-semibold text-emerald-500">Live GCP Pipeline Active</span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-800'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Level {user.ecoLevel} ({user.points} XP)
            </div>
            <button 
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'}`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Dashboard inner panels container */}
        <main
          id="dashboard-content"
          className="flex-1 p-6 md:p-8 outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

    </div>
  );
}


