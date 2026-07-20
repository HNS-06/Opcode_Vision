import React, { useState } from 'react';
import { Upload, Binary, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function FileUpload({ onFileUpload, onLoadSample, loading }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
          dragOver
            ? 'border-cyan-400 bg-cyan-950/20 shadow-2xl shadow-cyan-500/20 scale-[1.01]'
            : 'border-slate-700/80 bg-slate-900/40 hover:border-cyan-500/50 hover:bg-slate-900/60'
        }`}
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Binary className="w-10 h-10 animate-bounce" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Drop Executable Binary Here
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
          Upload PE (.exe, .dll, .sys), ELF, or raw binary file to inspect opcode frequencies, entropy signatures, call graphs, and compiler heuristics.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/25 transition-all">
            <Upload className="w-4 h-4" />
            Browse File
            <input type="file" onChange={handleChange} className="hidden" />
          </label>

          <span className="text-xs font-semibold text-slate-500 uppercase">OR</span>

          <button
            onClick={onLoadSample}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold text-sm border border-purple-500/30 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
            Analyze Sample Binary
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center gap-6 text-xs text-slate-500">
          <span>Supported Formats: PE / ELF / RAW</span>
          <span>•</span>
          <span>Capstone Engine Disassembler</span>
          <span>•</span>
          <span>Shannon Entropy</span>
        </div>
      </div>
    </div>
  );
}
