import React, { useState, useEffect } from 'react';
import { fetchPluginsList, executePlugin } from '../services/api';
import { Terminal, Play, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PluginsTab({ currentBinary }) {
  const [plugins, setPlugins] = useState([]);
  const [activePlugin, setActivePlugin] = useState(null);
  const [pluginOutput, setPluginOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPluginsList().then(setPlugins).catch(console.error);
  }, []);

  const handleRunPlugin = async (pluginId) => {
    if (!currentBinary?.metadata?.id && !currentBinary?.file_id) return;
    const fileId = currentBinary.file_id || currentBinary.metadata.id;
    setActivePlugin(pluginId);
    setLoading(true);
    setPluginOutput(null);
    try {
      const res = await executePlugin(pluginId, fileId);
      setPluginOutput(res);
    } catch (err) {
      setPluginOutput({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            Extensible Python Plugin Manager
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic Python analysis scripts loaded from <code>backend/plugins/</code> directory.
          </p>
        </div>

        {/* Plugins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plugins.map((plg) => (
            <div key={plg.id} className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-sm font-mono">{plg.name}</h4>
                <p className="text-xs text-slate-400 mt-1">File: <code>backend/plugins/{plg.filename}</code></p>
              </div>

              <button
                onClick={() => handleRunPlugin(plg.id)}
                disabled={loading && activePlugin === plg.id}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                {loading && activePlugin === plg.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Execute Plugin
              </button>
            </div>
          ))}
        </div>

        {/* Plugin Output Window */}
        {pluginOutput && (
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-400 font-mono">Plugin Output Log</span>
              <span className="text-[10px] text-slate-500 font-mono">STATUS: SUCCESS</span>
            </div>
            <pre className="text-xs text-slate-300 font-mono bg-slate-900/90 p-4 rounded-lg overflow-x-auto border border-slate-800">
              {JSON.stringify(pluginOutput, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
