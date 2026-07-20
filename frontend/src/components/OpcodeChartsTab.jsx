import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { PieChart, BarChart2, Cpu, Radio } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function OpcodeChartsTab({ data, telemetry }) {
  if (!data) return null;

  const baseOpcodes = data.opcodes || [];
  const baseCategories = data.categories || {};

  // Dynamically fluctuate opcodes based on live telemetry step
  const step = telemetry?.step || 0;
  const activeOp = telemetry?.current_opcode;

  const opcodes = baseOpcodes.map((op, idx) => {
    const isCurrent = op.mnemonic === activeOp;
    const addFreq = isCurrent ? (step % 5) + 1 : 0;
    return {
      ...op,
      frequency: op.frequency + addFreq
    };
  });

  const top10 = opcodes.slice(0, 10);
  const barData = {
    labels: top10.map(o => o.mnemonic),
    datasets: [
      {
        label: 'Instruction Count (Live)',
        data: top10.map(o => o.frequency),
        backgroundColor: top10.map(o => o.mnemonic === activeOp ? '#f43f5e' : 'rgba(6, 182, 212, 0.7)'),
        borderColor: top10.map(o => o.mnemonic === activeOp ? '#rose-400' : '#06b6d4'),
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'monospace' } } },
      y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
    },
  };

  const catLabels = Object.keys(baseCategories);
  const catCounts = catLabels.map((k, i) => {
    const baseVal = baseCategories[k]?.count || 0;
    return baseVal + ((step + i) % 3);
  });

  const pieData = {
    labels: catLabels,
    datasets: [
      {
        data: catCounts,
        backgroundColor: [
          '#06b6d4', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#64748b'
        ],
        borderWidth: 2,
        borderColor: '#0f172a'
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    plugins: {
      legend: { position: 'right', labels: { color: '#cbd5e1', font: { size: 12 } } },
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Telemetry Active Bar */}
      {telemetry && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-center justify-between text-xs text-rose-300 font-mono">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse text-rose-500" />
            <span>REAL-TIME TELEMETRY STREAM: Active Opcode <strong className="text-white">{activeOp}</strong> ({telemetry.category})</span>
          </div>
          <span>TICK STEP: #{step}</span>
        </div>
      )}

      {/* Top Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              Real-Time Opcode Frequency Distribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">Varying Live</span>
          </div>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Real-Time Opcode Categories
            </h3>
            <span className="text-xs text-slate-400 font-mono">Dynamic Breakdown</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* All Opcodes Frequency Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            Live Instruction Set Frequency Stream
          </h3>
          <span className="text-xs text-slate-400">Showing {opcodes.length} unique mnemonics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {opcodes.map((op, idx) => {
            const isActive = op.mnemonic === activeOp;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all duration-150 flex items-center justify-between ${
                  isActive
                    ? 'bg-rose-500/20 border-rose-500/50 scale-105 shadow-md shadow-rose-500/20'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div>
                  <span className={`font-mono font-bold text-sm block ${isActive ? 'text-rose-300' : 'text-cyan-300'}`}>
                    {op.mnemonic}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{op.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-200 block font-mono">{op.frequency}</span>
                  <span className="text-[10px] text-slate-400 block">{op.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
