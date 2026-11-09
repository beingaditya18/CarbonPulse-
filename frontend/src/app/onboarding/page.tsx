'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * OnboardingPage handles legacy account profiles.
 * Redirects immediately to the new premium calculator questionnaire.
 */
export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/calculator');
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Redirecting to Carbon Calculator...</span>
      </div>
    </div>
  );
}
