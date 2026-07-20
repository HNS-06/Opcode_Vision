import React from 'react';
import { Cpu, FileCode, Radio, Sparkles, RefreshCw } from 'lucide-react';

export default function Header({ currentBinary, onLoadSample, loading, isLive, onToggleLive }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-mono">
                Opcode<span className="text-cyan-400">Vision</span>
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PRO Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-400">Static & Live Binary Telemetry Disassembler</p>
          </div>
        </div>

        {/* Live Stream Switch & Load Demo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleLive}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              isLive
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-500/10'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`} />
            {isLive ? 'LIVE STREAM ACTIVE' : 'ENABLE LIVE MONITOR'}
          </button>

          {currentBinary ? (
            <div className="hidden md:flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <div className="text-sm">
                <span className="text-slate-400 text-xs block">Active Target</span>
                <span className="font-mono font-semibold text-slate-200">{currentBinary.metadata?.filename}</span>
              </div>
              <span className="ml-2 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                {currentBinary.metadata?.file_type} ({currentBinary.metadata?.arch})
              </span>
            </div>
          ) : null}

          <button
            onClick={onLoadSample}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-medium text-sm shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Demo Executable
          </button>
        </div>
      </div>
    </header>
  );
}
