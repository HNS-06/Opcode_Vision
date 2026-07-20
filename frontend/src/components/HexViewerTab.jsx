import React, { useState } from 'react';
import { Binary, Search, Copy, Check, Radio } from 'lucide-react';

export default function HexViewerTab({ data, telemetry }) {
  if (!data) return null;

  const hexDump = data.hex_dump || [];
  const [filter, setFilter] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [copied, setCopied] = useState(false);

  const activeOffset = telemetry?.active_offset_hex;

  const filteredDump = hexDump.filter(row =>
    row.offset.toLowerCase().includes(filter.toLowerCase()) ||
    row.hex.toLowerCase().includes(filter.toLowerCase()) ||
    row.ascii.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCopyRow = (row) => {
    navigator.clipboard.writeText(`${row.offset} | ${row.hex} | ${row.ascii}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Binary className="w-5 h-5 text-cyan-400" />
              Real-Time Binary Hex Inspector
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Active memory offset line highlights in real time as the execution pointer (`EIP`) moves.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {telemetry && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 text-rose-400 font-mono text-xs border border-rose-500/30">
                <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                Active Offset: {activeOffset || '0x00000000'}
              </div>
            )}

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search hex / offset / ascii..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-64"
              />
            </div>
          </div>
        </div>

        {/* Hex Viewer Table */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto font-mono text-xs">
          <div className="grid grid-cols-12 gap-4 pb-2 border-b border-slate-800 text-slate-500 font-bold uppercase">
            <div className="col-span-3">Offset</div>
            <div className="col-span-6">Hex Bytes (16 bytes / line)</div>
            <div className="col-span-3">ASCII Text</div>
          </div>

          <div className="divide-y divide-slate-900/60 pt-2 space-y-1">
            {filteredDump.map((row, idx) => {
              const isActiveOffset = row.offset === activeOffset;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedRow(row)}
                  className={`grid grid-cols-12 gap-4 py-1 px-2 rounded cursor-pointer transition-colors ${
                    isActiveOffset
                      ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50 font-bold'
                      : selectedRow?.offset === row.offset
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'hover:bg-slate-900'
                  }`}
                >
                  <div className={`col-span-3 font-bold ${isActiveOffset ? 'text-rose-400' : 'text-cyan-400'}`}>{row.offset}</div>
                  <div className="col-span-6 text-slate-300 tracking-wider">{row.hex}</div>
                  <div className="col-span-3 text-purple-300 tracking-widest">{row.ascii}</div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedRow && (
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="font-mono text-xs text-slate-300">
              Selected: <span className="text-cyan-400 font-bold">{selectedRow.offset}</span> — <span className="text-purple-300 font-bold">{selectedRow.ascii}</span>
            </div>
            <button
              onClick={() => handleCopyRow(selectedRow)}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Hex Line'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
