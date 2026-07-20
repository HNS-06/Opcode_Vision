import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Bug, Radio } from 'lucide-react';

export default function EvasionTab({ data, telemetry }) {
  if (!data) return null;

  const evasion = data.evasion || { evasion_score: 0, has_evasion: false, indicators: [] };
  const indicators = evasion.indicators || [];

  return (
    <div className="space-y-6">
      {/* Telemetry Active Banner */}
      {telemetry && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-center justify-between text-xs text-rose-300 font-mono">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse text-rose-500" />
            <span>REAL-TIME EVASION MONITOR: Active Threat Risk Score <strong className="text-white">{telemetry.threat_score} / 100</strong></span>
          </div>
          <span>TICK STEP: #{telemetry.step}</span>
        </div>
      )}

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Anti-Analysis & Evasion Detector ({indicators.length} Evaluated)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies anti-debugging APIs, anti-VM hardware instruction checks (`CPUID`, `RDTSC`), and direct `SYSCALL` bypasses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
              evasion.has_evasion ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {evasion.has_evasion ? <AlertTriangle className="w-4 h-4 animate-bounce" /> : <CheckCircle2 className="w-4 h-4" />}
              {evasion.has_evasion ? `Evasion Risk Score: ${evasion.evasion_score}/100` : 'Standard Environment Security'}
            </div>
          </div>
        </div>

        {/* Indicators List */}
        <div className="space-y-3">
          {indicators.map((ind, idx) => {
            const isFlagged = ind.status === 'FLAGGED';
            return (
              <div key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4 hover:border-slate-700 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold text-sm ${isFlagged ? 'text-rose-400' : 'text-cyan-300'}`}>
                      {ind.indicator}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {ind.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{ind.description}</p>
                </div>

                <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                  ind.risk === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-400'
                    : ind.risk === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {ind.risk}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
