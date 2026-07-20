import React from 'react';
import { Layers, Lock, Eye } from 'lucide-react';

export default function SectionsTab({ data }) {
  if (!data) return null;

  const sections = data.sections || [];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Executable Memory Sections ({sections.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Section headers, virtual address mapping, permissions, and byte entropy.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Section Name</th>
                <th className="py-3 px-4">Virtual Address</th>
                <th className="py-3 px-4">Virtual Size</th>
                <th className="py-3 px-4">Raw Size</th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4">Entropy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sections.map((sec, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-cyan-300">{sec.name}</td>
                  <td className="py-3 px-4 text-slate-300">0x{sec.virtual_address?.toString(16).toUpperCase()}</td>
                  <td className="py-3 px-4 text-slate-300">{sec.virtual_size} B</td>
                  <td className="py-3 px-4 text-slate-300">{sec.raw_size} B</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      sec.permissions?.includes('X') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {sec.permissions}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      sec.entropy > 7.0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {sec.entropy}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
