import React from 'react';
import { Cpu, ShieldCheck, ShieldAlert, Binary, Hash, FileCode, CheckCircle2, XCircle } from 'lucide-react';

export default function OverviewTab({ data }) {
  if (!data) return null;

  const { metadata, statistics, mitigations, entropy } = data;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Binary Analysis Report</span>
            <h2 className="text-2xl font-bold text-white font-mono mt-1">{metadata?.filename}</h2>
            <p className="text-xs text-slate-400 mt-1">MD5: {metadata?.md5}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Format & Arch</span>
              <span className="text-sm font-bold text-cyan-400">{metadata?.file_type} ({metadata?.arch})</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Overall Entropy</span>
              <span className={`text-sm font-bold ${entropy?.overall > 7.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {entropy?.overall} / 8.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Instructions</span>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{statistics?.total_instructions}</div>
          <span className="text-xs text-slate-500">Disassembled instructions</span>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Unique Opcodes</span>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">{statistics?.unique_instructions}</div>
          <span className="text-xs text-slate-500">Distinct instruction mnemonics</span>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Code / Data Ratio</span>
          <div className="text-2xl font-extrabold text-purple-400 mt-1 font-mono">{(statistics?.code_data_ratio * 100).toFixed(1)}%</div>
          <span className="text-xs text-slate-500">Executable code footprint</span>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Avg Function Size</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{statistics?.avg_function_size}</div>
          <span className="text-xs text-slate-500">Instructions per routine</span>
        </div>
      </div>

      {/* Compiler Detection & Mitigations Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compiler Heuristics Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Compiler & Toolchain Detection
            </h3>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Confidence: {Math.round((statistics?.compiler_confidence || 0.5) * 100)}%
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-1">Detected Compiler Signature</span>
            <div className="text-lg font-bold text-cyan-400 font-mono">{statistics?.compiler || 'Unknown'}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-2">Detection Evidences</span>
            <ul className="space-y-1">
              {(statistics?.compiler_details || ['Analyzed section names and imported CRT libraries']).map((det, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {det}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Security Mitigations Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Binary Security Mitigations
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-xs font-semibold text-slate-400 block mb-1">ASLR</span>
              {mitigations?.ASLR ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Enabled</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400"><XCircle className="w-3.5 h-3.5" /> Disabled</span>
              )}
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-xs font-semibold text-slate-400 block mb-1">DEP / NX</span>
              {mitigations?.DEP ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Enabled</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400"><XCircle className="w-3.5 h-3.5" /> Disabled</span>
              )}
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-xs font-semibold text-slate-400 block mb-1">SafeSEH</span>
              {mitigations?.SafeSEH ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Enabled</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500"><XCircle className="w-3.5 h-3.5" /> N/A</span>
              )}
            </div>
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
            Address Space Layout Randomization (ASLR) and Data Execution Prevention (DEP) prevent exploit execution.
          </div>
        </div>
      </div>
    </div>
  );
}
