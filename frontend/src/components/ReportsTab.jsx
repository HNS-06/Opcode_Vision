import React, { useState } from 'react';
import { exportReportFile } from '../services/api';
import { FileText, Download, FileCode, FileType, CheckCircle, RefreshCw } from 'lucide-react';

export default function ReportsTab({ currentBinary }) {
  const [downloading, setDownloading] = useState(null);

  const handleExport = async (format) => {
    if (!currentBinary?.file_id && !currentBinary?.metadata?.id) return;
    const fileId = currentBinary.file_id || currentBinary.metadata.id;
    setDownloading(format);
    try {
      await exportReportFile(fileId, format);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Report Exporter & Summary Generation
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Export full static binary analysis reports into HTML, Markdown, JSON, or vector PDF format.
          </p>
        </div>

        {/* Report Format Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* PDF Card */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between gap-4">
            <div>
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <FileType className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">PDF Executive Report</h4>
              <p className="text-xs text-slate-400 mt-1">Formatted document with overview tables, section breakdowns & top opcodes.</p>
            </div>
            <button
              onClick={() => handleExport('pdf')}
              disabled={downloading === 'pdf'}
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              {downloading === 'pdf' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download PDF
            </button>
          </div>

          {/* HTML Card */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between gap-4">
            <div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <FileCode className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">HTML Interactive Report</h4>
              <p className="text-xs text-slate-400 mt-1">Standalone styled web page with dark theme CSS and embedded tables.</p>
            </div>
            <button
              onClick={() => handleExport('html')}
              disabled={downloading === 'html'}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              {downloading === 'html' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download HTML
            </button>
          </div>

          {/* Markdown Card */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between gap-4">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Markdown Document</h4>
              <p className="text-xs text-slate-400 mt-1">GitHub Flavored Markdown report suitable for technical documentation.</p>
            </div>
            <button
              onClick={() => handleExport('markdown')}
              disabled={downloading === 'markdown'}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              {downloading === 'markdown' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download Markdown
            </button>
          </div>

          {/* JSON Card */}
          <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between gap-4">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <FileCode className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Raw JSON Payload</h4>
              <p className="text-xs text-slate-400 mt-1">Full raw structural JSON data payload for automated parsing.</p>
            </div>
            <button
              onClick={() => handleExport('json')}
              disabled={downloading === 'json'}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              {downloading === 'json' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
