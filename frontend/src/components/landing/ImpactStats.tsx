import { Check, Award } from 'lucide-react';

interface ImpactStatsProps {
  isDark: boolean;
}

/**
 * ImpactStats component displaying environmental standards compliance and platform trust metrics.
 */
export function ImpactStats({ isDark }: ImpactStatsProps) {
  const credentials = [
    { title: 'Seattle SMC 22.920', desc: 'Statutory municipal benchmark alignment' },
    { title: 'EPA Portfolio Manager', desc: 'Direct Scope 1 & 2 stoichiometric calibration' },
    { title: 'Cluster-Aware Holdout', desc: 'Facility-level grouped holdout evaluation' },
    { title: 'Cryptographic Provenance', desc: 'SHA-256 data verification manifest' },
  ];

  return (
    <section className={`py-16 px-6 border-t ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-emerald-100 bg-white'}`}>
      <div className="max-w-7xl mx-auto text-center space-y-8">

        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#047857] border border-emerald-200">
            <Award className="w-3.5 h-3.5" /> Environmental Audit & Compliance
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Built on Rigorous Environmental Standards
          </h2>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            CarbonPulse AI+ enforces strict physical bounds, cluster-aware longitudinal verification, and cryptographic provenance manifests to ensure peer-reviewed scientific defensibility.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {credentials.map((cred) => (
            <div
              key={cred.title}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all hover:border-emerald-400 ${isDark
                  ? 'bg-zinc-900/50 border-zinc-800'
                  : 'bg-emerald-50/40 border-emerald-100/80 shadow-xs'
                }`}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#047857] flex items-center justify-center mb-3">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{cred.title}</p>
                <p className={`text-[10px] mt-1 leading-tight ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{cred.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
