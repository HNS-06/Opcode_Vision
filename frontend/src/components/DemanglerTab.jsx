import React, { useState } from 'react';
import { Cpu, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function DemanglerTab({ data }) {
  const [symbol, setSymbol] = useState('?InitInstance@CWinApp@@UAEHXZ');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDemangle = async () => {
    if (!symbol) return;
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/demangle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: symbol })
      });
      const resData = await response.json();
      setResult(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const functions = data?.functions || [];
  const mangledFunctions = functions.filter(f => f.is_mangled);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            C++ Symbol Demangler Engine
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Demangles MSVC C++ mangled symbols (`?Name@Class@@...`) and GCC / Clang Itanium ABI symbols (`_Z...`).
          </p>
        </div>

        {/* Demangle Input Form */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
          <label className="text-xs font-semibold text-slate-300 block">Enter Mangled Symbol Name</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. ?InitInstance@CWinApp@@UAEHXZ or _Z3fooPKcI"
              className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleDemangle}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
              Demangle Symbol
            </button>
          </div>

          {result && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Scheme Detected: <strong className="text-purple-300">{result.scheme}</strong></span>
                <span>Mangled: {result.is_mangled ? 'YES' : 'NO'}</span>
              </div>
              <div className="text-emerald-400 font-bold text-sm pt-1">
                {result.demangled}
              </div>
            </div>
          )}
        </div>

        {/* Mangled Symbols in Current Binary */}
        {mangledFunctions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Mangled Symbols Found in Executable ({mangledFunctions.length})</h4>
            <div className="space-y-2">
              {mangledFunctions.map((fn, idx) => (
                <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400">{fn.name}</span>
                  <span className="text-cyan-300 font-bold">{fn.demangled_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
