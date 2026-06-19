import { Check } from 'lucide-react';

interface ImpactStatsProps {
  isDark: boolean;
}

/**
 * ImpactStats component displaying compliance and platform trust metrics.
 */
export function ImpactStats({ isDark }: ImpactStatsProps) {
  return (
    <section className="py-16 max-w-7xl mx-auto px-6 text-center space-y-6">
      <h2 className="text-2xl font-bold">Built with Google Cloud Enterprise Security</h2>
      <p className={`max-w-2xl mx-auto text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        CarbonPulse AI+ operates on GCP Identity-Aware Proxy (IAP), Google Cloud Armor firewalls, and encrypted Google Cloud Storage buckets, ensuring compliance with strict privacy and enterprise audit requirements.
      </p>
      <div className="flex justify-center flex-wrap gap-8 pt-4">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          <span className="text-xs uppercase tracking-wider font-bold">Cloud Armor WAF</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          <span className="text-xs uppercase tracking-wider font-bold">GCP IAP Identity</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          <span className="text-xs uppercase tracking-wider font-bold">Encrypted GCS Bucket</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          <span className="text-xs uppercase tracking-wider font-bold">OWASP Secure-Headers</span>
        </div>
      </div>
    </section>
  );
}
