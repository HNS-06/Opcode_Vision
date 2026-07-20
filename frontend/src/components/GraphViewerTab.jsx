import React, { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { GitBranch, Network, Cpu, Radio } from 'lucide-react';

cytoscape.use(dagre);

export default function GraphViewerTab({ data, telemetry }) {
  if (!data) return null;

  const [graphMode, setGraphMode] = useState('callgraph');
  const [selectedFnIndex, setSelectedFnIndex] = useState(0);

  const containerRef = useRef(null);
  const cyRef = useRef(null);

  const functions = data.functions || [];
  const callGraphData = data.call_graph || { elements: { nodes: [], edges: [] } };

  const currentFn = functions[selectedFnIndex] || functions[0];
  const cfgElements = currentFn?.cfg?.elements || { nodes: [], edges: [] };

  const activeNodeId = graphMode === 'callgraph' ? telemetry?.active_function : telemetry?.active_block;

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = graphMode === 'callgraph' ? callGraphData.elements : cfgElements;

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#06b6d4',
            'label': 'data(label)',
            'color': '#f8fafc',
            'font-size': '12px',
            'font-family': 'monospace',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': '140px',
            'height': '45px',
            'shape': 'round-rectangle',
            'border-width': 2,
            'border-color': '#38bdf8',
            'text-wrap': 'wrap',
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#a855f7',
            'target-arrow-color': '#a855f7',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],
      layout: {
        name: 'dagre',
        rankDir: 'TB',
        nodeSep: 30,
        edgeSep: 10,
        rankSep: 40
      }
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphMode, selectedFnIndex, data]);

  // Highlight active node on telemetry tick
  useEffect(() => {
    if (cyRef.current && activeNodeId) {
      cyRef.current.nodes().style({ 'background-color': '#06b6d4', 'border-color': '#38bdf8' });
      const activeNode = cyRef.current.getElementById(activeNodeId);
      if (activeNode && activeNode.length > 0) {
        activeNode.style({ 'background-color': '#f43f5e', 'border-color': '#rose-400' });
      }
    }
  }, [telemetry, activeNodeId]);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-cyan-400" />
              Real-Time Graph Visualizer Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Active node glows rose-red in real time as live execution progresses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {telemetry && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 text-rose-400 font-mono text-xs border border-rose-500/30">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Active Node: {activeNodeId || 'main'}
              </div>
            )}

            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setGraphMode('callgraph')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  graphMode === 'callgraph' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Call Graph
              </button>
              <button
                onClick={() => setGraphMode('cfg')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  graphMode === 'cfg' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Function CFG
              </button>
            </div>

            {graphMode === 'cfg' && (
              <select
                value={selectedFnIndex}
                onChange={(e) => setSelectedFnIndex(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 font-mono"
              >
                {functions.map((fn, idx) => (
                  <option key={idx} value={idx}>
                    {fn.name} (0x{fn.address.toString(16)})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Cytoscape Canvas */}
        <div className="relative w-full h-[500px] bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden">
          <div ref={containerRef} className="w-full h-full"></div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
          <span>Pan: Drag canvas | Zoom: Mouse scroll | Rose Node: Active Execution Target</span>
          <span className="font-mono">Nodes: {graphMode === 'callgraph' ? callGraphData.total_nodes : currentFn?.basic_block_count} | Edges: {graphMode === 'callgraph' ? callGraphData.total_edges : currentFn?.cyclomatic_complexity}</span>
        </div>
      </div>
    </div>
  );
}
