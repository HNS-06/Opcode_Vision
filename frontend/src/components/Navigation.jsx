import React from 'react';
import { LayoutDashboard, Radio, PieChart, Activity, Layers, Network, GitBranch, Binary, ShieldAlert, Cpu, ArrowLeftRight, Terminal, FileText } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'live', label: 'Live Monitor', icon: Radio, live: true },
  { id: 'opcodes', label: 'Opcode Charts', icon: PieChart },
  { id: 'entropy', label: 'Entropy Engine', icon: Activity },
  { id: 'sections', label: 'Sections', icon: Layers },
  { id: 'imports', label: 'API Imports', icon: Network },
  { id: 'evasion', label: 'Evasion Detector', icon: ShieldAlert },
  { id: 'demangler', label: 'Demangler', icon: Cpu },
  { id: 'hex', label: 'Hex Inspector', icon: Binary },
  { id: 'graphs', label: 'Graphs & CFG', icon: GitBranch },
  { id: 'compare', label: 'Compare Binaries', icon: ArrowLeftRight },
  { id: 'plugins', label: 'Plugins', icon: Terminal },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export default function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-slate-900/60 border-b border-slate-800 px-6 py-2 sticky top-[73px] z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap relative ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              {tab.label}
              {tab.live && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
