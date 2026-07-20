import React, { useState } from 'react';
import { compareBinaries } from '../services/api';
import { ArrowLeftRight, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CompareTab({ currentBinary }) {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!fileA || !fileB) return;
    setLoading(true);
    setError(null);
    try {
      const res = await compareBinaries(fileA, fileB);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            Binary Similarity & Diffing Module
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare two executable binaries using opcode frequency Cosine Similarity, Jaccard index, and section layout overlap.
          </p>
        </div>

        {/* Binary Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-cyan-400 uppercase block">Binary File A</span>
            <input
              type="file"
              onChange={(e) => setFileA(e.target.files[0])}
              className="text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
            />
            {fileA && <p className="text-xs text-slate-400 font-mono">Selected: {fileA.name}</p>}
          </div>

          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-purple-400 uppercase block">Binary File B</span>
            <input
              type="file"
              onChange={(e) => setFileB(e.target.files[0])}
              className="text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30"
            />
            {fileB && <p className="text-xs text-slate-400 font-mono">Selected: {fileB.name}</p>}
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={!fileA || !fileB || loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
          Run Binary Similarity Analysis
        </button>

        {error && <p className="text-xs text-rose-400 text-center">{error}</p>}

        {/* Results Card */}
        {result && (
          <div className="pt-4 border-t border-slate-800 space-y-6">
            <div className="bg-gradient-to-r from-cyan-950/40 to-purple-950/40 p-6 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Overall Similarity Match</span>
                <div className="text-4xl font-extrabold text-cyan-400 font-mono mt-1">
                  {result.comparison?.overall_similarity_percentage}%
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Cosine Similarity</span>
                  <span className="text-sm font-bold text-purple-300 font-mono">{result.comparison?.metrics?.opcode_cosine_similarity}</span>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Jaccard Index</span>
                  <span className="text-sm font-bold text-cyan-300 font-mono">{result.comparison?.metrics?.opcode_jaccard_index}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200">Shared Instruction Opcodes ({result.comparison?.shared_opcodes?.length})</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.comparison?.shared_opcodes?.map((op, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-xs border border-cyan-500/20">
                      {op}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200">API Import Overlap</span>
                <p className="text-sm font-mono text-purple-300">
                  {result.comparison?.shared_imports_count} matching API import function calls.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
