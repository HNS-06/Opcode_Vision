import React, { useState } from 'react';
import { Network, ShieldAlert, Cpu, Search, Radio } from 'lucide-react';

export default function ImportsTab({ data, telemetry }) {
  if (!data) return null;

  const imports = data.imports || [];
  const [filter, setFilter] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  const activeImport = telemetry?.active_import;
  const categories = ['ALL', ...Array.from(new Set(imports.map(i => i.category)))];

  const filteredImports = imports.filter(i => {
    const matchesCat = selectedCat === 'ALL' || i.category === selectedCat;
    const matchesQuery = i.function_name.toLowerCase().includes(filter.toLowerCase()) || i.library.toLowerCase().includes(filter.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400" />
              API Imports & Live System Call Classification ({imports.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Active API system call glows in real time as the execution trace progresses.</p>
          </div>

          <div className="flex items-center gap-3">
            {telemetry && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 text-rose-400 font-mono text-xs border border-rose-500/30">
                <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                Active Syscall: {activeImport || 'N/A'}
              </div>
            )}

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search function or DLL..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-64"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCat === cat
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Imports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredImports.map((imp, idx) => {
            const isActive = imp.function_name === activeImport;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all duration-150 space-y-1 ${
                  isActive
                    ? 'bg-rose-500/20 border-rose-500/50 scale-105 shadow-md shadow-rose-500/20'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">{imp.library}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {imp.category}
                  </span>
                </div>
                <div className={`font-mono font-bold text-sm truncate ${isActive ? 'text-rose-300' : 'text-purple-300'}`} title={imp.function_name}>
                  {imp.function_name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
