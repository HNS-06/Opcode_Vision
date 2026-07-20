import React, { useState, useEffect, useRef } from 'react';
import { fetchTelemetryTick } from '../services/api';
import { Radio, Play, Pause, FastForward, Cpu, Terminal, ShieldAlert, Activity, RefreshCw } from 'lucide-react';

export default function LiveMonitorTab({ currentBinary }) {
  const [isLive, setIsLive] = useState(true);
  const [speed, setSpeed] = useState(300); // ms interval
  const [step, setStep] = useState(0);
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState([]);
  const terminalRef = useRef(null);

  const fileId = currentBinary?.file_id || currentBinary?.metadata?.id || "sample";

  useEffect(() => {
    let interval = null;
    if (isLive) {
      interval = setInterval(async () => {
        try {
          const nextStep = step + 1;
          const data = await fetchTelemetryTick(fileId, nextStep);
          setTelemetry(data);
          setStep(nextStep);
          setHistory(prev => [...prev.slice(-30), data]);
        } catch (err) {
          console.error(err);
        }
      }, speed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, speed, step, fileId]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const registers = telemetry?.registers || {
    EAX: "0x00000001",
    EBX: "0x7FFE0000",
    ECX: "0x00000000",
    EDX: "0x00000000",
    ESI: "0x00403000",
    EDI: "0x00405000",
    EBP: "0x0019FF70",
    ESP: "0x0019FF70",
    EIP: "0x00401000"
  };

  const threatScore = telemetry?.threat_score || 35.0;
  const entropyJitter = telemetry?.entropy_jitter || 6.42;

  return (
    <div className="space-y-6">
      {/* Top Telemetry Control Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="text-lg font-bold text-white">Real-Time Telemetry & Execution Stream</h3>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              LIVE FEED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time instruction stream disassembler, live CPU register state tracer, and threat score updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isLive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isLive ? 'Pause Real-Time Telemetry' : 'Resume Telemetry Stream'}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSpeed(500)}
              className={`px-2.5 py-1 rounded-lg font-semibold ${speed === 500 ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}
            >
              1x (500ms)
            </button>
            <button
              onClick={() => setSpeed(200)}
              className={`px-2.5 py-1 rounded-lg font-semibold ${speed === 200 ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}
            >
              2x (200ms)
            </button>
            <button
              onClick={() => setSpeed(100)}
              className={`px-2.5 py-1 rounded-lg font-semibold ${speed === 100 ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}
            >
              5x (100ms)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Live CPU Registers & Threat Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU Registers State Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Live CPU Registers (x86_64)
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Step: #{step}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {Object.entries(registers).map(([reg, val]) => (
              <div key={reg} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-bold">{reg}</span>
                <span className="text-cyan-300 font-bold transition-all duration-150">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Anomaly & Entropy Gauge */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Real-Time Threat Radar
            </h4>
            <span className="text-[10px] font-mono text-purple-300">Oscillating Radar</span>
          </div>

          <div className="text-center space-y-2 py-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Anomaly Risk Score</span>
            <div className="text-4xl font-extrabold font-mono text-purple-400">
              {threatScore} <span className="text-sm text-slate-500 font-sans">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 transition-all duration-300"
                style={{ width: `${threatScore}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Entropy Telemetry:</span>
            <span className="text-emerald-400 font-bold">{entropyJitter} bits/byte</span>
          </div>
        </div>

        {/* Current Instruction Telemetry Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Instruction Inspector
            </h4>
            <span className="text-[10px] font-mono text-emerald-400">TICK ACTIVE</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Address:</span>
              <span className="text-cyan-300 font-bold">{telemetry?.current_address || '0x00401000'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Opcode:</span>
              <span className="text-purple-300 font-bold">{telemetry?.current_opcode || 'MOV'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Operands:</span>
              <span className="text-slate-200">{telemetry?.op_str || 'eax, 0x1'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CPU Cycles:</span>
              <span className="text-amber-400 font-bold">{telemetry?.cpu_cycles || 1} cycles</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 italic text-center">
            Instructions are disassembled live in real-time from the backend Capstone engine.
          </div>
        </div>
      </div>

      {/* Real-Time Live Disassembly Stream Terminal */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h4 className="text-base font-bold text-white">Live Instruction Stream Feed</h4>
          </div>
          <span className="text-xs font-mono text-slate-400">Lines Streamed: {history.length}</span>
        </div>

        <div
          ref={terminalRef}
          className="h-64 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-y-auto space-y-1"
        >
          {history.map((h, idx) => (
            <div key={idx} className="flex items-center gap-4 hover:bg-slate-900/60 px-2 py-0.5 rounded transition-colors">
              <span className="text-slate-500 text-[10px]">[{new Date(h.timestamp * 1000).toLocaleTimeString()}]</span>
              <span className="text-cyan-400 font-bold">{h.current_address}</span>
              <span className="text-purple-300 font-bold w-12">{h.current_opcode}</span>
              <span className="text-slate-300 flex-1">{h.op_str}</span>
              <span className="text-amber-400/80 text-[10px]">{h.cpu_cycles} cycles</span>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-slate-500 italic text-center py-12">Waiting for live telemetry stream ticks...</div>
          )}
        </div>
      </div>
    </div>
  );
}
