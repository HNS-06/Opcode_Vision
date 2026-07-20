import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import FileUpload from './components/FileUpload';
import OverviewTab from './components/OverviewTab';
import LiveMonitorTab from './components/LiveMonitorTab';
import OpcodeChartsTab from './components/OpcodeChartsTab';
import EntropyTab from './components/EntropyTab';
import SectionsTab from './components/SectionsTab';
import ImportsTab from './components/ImportsTab';
import EvasionTab from './components/EvasionTab';
import DemanglerTab from './components/DemanglerTab';
import HexViewerTab from './components/HexViewerTab';
import GraphViewerTab from './components/GraphViewerTab';
import CompareTab from './components/CompareTab';
import PluginsTab from './components/PluginsTab';
import ReportsTab from './components/ReportsTab';

import { uploadAndAnalyzeBinary, fetchSampleAnalysis, fetchTelemetryTick } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Global Real-Time Telemetry Loop State
  const [isLive, setIsLive] = useState(true);
  const [telemetryStep, setTelemetryStep] = useState(0);
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    handleLoadSample();
  }, []);

  // Global real-time telemetry tick runner
  useEffect(() => {
    let interval = null;
    if (isLive && analysisData) {
      const fileId = analysisData.file_id || analysisData.metadata?.id || "sample";
      interval = setInterval(async () => {
        try {
          const nextStep = telemetryStep + 1;
          const tickData = await fetchTelemetryTick(fileId, nextStep);
          setTelemetry(tickData);
          setTelemetryStep(nextStep);
        } catch (err) {
          console.error(err);
        }
      }, 300);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, analysisData, telemetryStep]);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await uploadAndAnalyzeBinary(file);
      setAnalysisData(data);
      setActiveTab('overview');
    } catch (err) {
      setError(err.message || 'Failed to analyze binary file');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSampleAnalysis();
      setAnalysisData(data);
    } catch (err) {
      setError('Could not connect to backend server. Make sure Python backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      <Header
        currentBinary={analysisData}
        onLoadSample={handleLoadSample}
        loading={loading}
        isLive={isLive}
        onToggleLive={() => setIsLive(!isLive)}
      />

      {analysisData && (
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-xs font-bold underline">Dismiss</button>
          </div>
        )}

        {!analysisData && !loading ? (
          <FileUpload onFileUpload={handleFileUpload} onLoadSample={handleLoadSample} loading={loading} />
        ) : loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-300 font-mono">Disassembling binary & computing opcode distribution...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && <OverviewTab data={analysisData} telemetry={telemetry} />}
            {activeTab === 'live' && <LiveMonitorTab currentBinary={analysisData} telemetry={telemetry} />}
            {activeTab === 'opcodes' && <OpcodeChartsTab data={analysisData} telemetry={telemetry} />}
            {activeTab === 'entropy' && <EntropyTab data={analysisData} telemetry={telemetry} />}
            {activeTab === 'sections' && <SectionsTab data={analysisData} telemetry={telemetry} />}
            {activeTab === 'imports' && <ImportsTab data={analysisData} telemetry={telemetry} />}
            {activeTab === 'evasion' && <EvasionTab data={analysisData} telemetry={telemetry} />}
            {activeTab === 'demangler' && <DemanglerTab data={analysisData} telemetry={telemetry} />}
            {activeTab === 'hex' && <HexViewerTab data={analysisData} telemetry={telemetry} />}
            {activeTab === 'graphs' && <GraphViewerTab data={analysisData} telemetry={telemetry} />}
            {activeTab === 'compare' && <CompareTab currentBinary={analysisData} telemetry={telemetry} />}
            {activeTab === 'plugins' && <PluginsTab currentBinary={analysisData} telemetry={telemetry} />}
            {activeTab === 'reports' && <ReportsTab currentBinary={analysisData} telemetry={telemetry} />}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        OpcodeVision Professional Real-Time Platform • Capstone Disassembler • Shannon Entropy • Synchronized Telemetry
      </footer>
    </div>
  );
}
