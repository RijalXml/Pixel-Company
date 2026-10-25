import React, { useState } from 'react';
import { CompanyTask } from '../types/company';
import { ROLE_ICONS } from '../sim/employeesData';
import { X, Copy, Check, Download, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { playClickSound } from '../sim/sound';

interface TaskDetailModalProps {
  task: CompanyTask;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'final' | 'history'>('steps');

  const handleCopy = () => {
    playClickSound();
    const content = task.finalDeliverable || JSON.stringify(task, null, 2);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    playClickSound();
    const content = task.finalDeliverable || JSON.stringify(task, null, 2);
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `INTI-LAPORAN-${task.id.replace('#', '')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl border-4 border-[#243557] bg-[#0c1324] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1e293b] bg-[#090f1d] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-xs text-cyan-400">{task.id}</span>
            <h3 className="font-sans text-base font-bold text-slate-100">{task.title}</h3>
            <span
              className={`rounded px-2 py-0.5 font-terminal text-xs uppercase ${
                task.status === 'selesai'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : task.status === 'revisi'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
              }`}
            >
              {task.status.replace('_', ' ')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1e293b] bg-[#0d1629] px-4">
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`border-b-2 px-4 py-2 font-pixel text-xs transition-colors ${
              activeTab === 'steps'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Alur Departemen ({task.steps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('final')}
            className={`border-b-2 px-4 py-2 font-pixel text-xs transition-colors ${
              activeTab === 'final'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Dossier Laporan Lengkap
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`border-b-2 px-4 py-2 font-pixel text-xs transition-colors ${
              activeTab === 'history'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Riwayat Serah Terima ({task.history.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 font-sans text-sm text-slate-200">
          {activeTab === 'steps' && (
            <div className="space-y-4">
              {task.steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border-2 p-3 transition-colors ${
                    step.status === 'completed'
                      ? 'border-emerald-800/80 bg-[#091522]'
                      : step.status === 'in_progress'
                      ? 'border-cyan-500 bg-[#0c1a30] ring-1 ring-cyan-500/30'
                      : 'border-slate-800 bg-[#080d19] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#1b263b] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ROLE_ICONS[step.role]}</span>
                      <div>
                        <span className="font-pixel text-[11px] text-cyan-300">
                          [{step.role.toUpperCase()}] {step.title}
                        </span>
                        <p className="font-terminal text-xs text-slate-400">{step.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {step.status === 'completed' ? (
                        <span className="flex items-center gap-1 font-terminal text-xs text-emerald-400">
                          <CheckCircle className="h-3.5 w-3.5" /> Selesai ({step.completedAt})
                        </span>
                      ) : step.status === 'in_progress' ? (
                        <span className="flex items-center gap-1 font-terminal text-xs text-cyan-400 animate-pulse">
                          Sedang Bekerja...
                        </span>
                      ) : (
                        <span className="font-terminal text-xs text-slate-500">Antre</span>
                      )}
                    </div>
                  </div>

                  {/* Notes & Output */}
                  {step.notes && (
                    <div className="mt-2 text-xs italic text-amber-300/90 font-terminal">
                      💡 {step.notes}
                    </div>
                  )}

                  {step.output ? (
                    <div className="mt-2.5 rounded border border-[#1b2a47] bg-[#060a14] p-3 text-xs leading-relaxed font-mono whitespace-pre-wrap text-slate-300 max-h-60 overflow-y-auto">
                      {step.output}
                    </div>
                  ) : (
                    step.status === 'in_progress' && (
                      <div className="mt-2 font-terminal text-xs text-cyan-400/80 animate-pulse">
                        ⏳ AI Worker sedang memproses instruksi secara real-time...
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'final' && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span className="font-pixel text-xs text-slate-200">Kompilasi Dossier Eksekutif</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded border border-[#273859] bg-[#121c33] px-3 py-1 font-terminal text-xs text-cyan-300 hover:border-cyan-400"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Markdown'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1 rounded border border-[#273859] bg-[#121c33] px-3 py-1 font-terminal text-xs text-amber-300 hover:border-amber-400"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh .MD</span>
                  </button>
                </div>
              </div>

              {task.finalDeliverable ? (
                <div className="rounded-lg border-2 border-[#1c2c4c] bg-[#060a14] p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
                  {task.finalDeliverable}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <span className="text-3xl mb-2">📁</span>
                  <p className="font-pixel text-xs text-slate-300">Tugas Masih Dalam Pengerjaan</p>
                  <p className="font-terminal text-sm mt-1">
                    Dossier lengkap akan otomatis tersusun setelah seluruh departemen dan Reviewer menyelesaikan tugasnya.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              {task.history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded border border-[#1a263d] bg-[#080d19] p-2.5 text-xs font-terminal"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-pixel text-[10px]">[{h.timestamp}]</span>
                    <span className="text-slate-300">{h.message}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <span>{ROLE_ICONS[h.fromRole]} {h.fromRole.toUpperCase()}</span>
                    <span>➜</span>
                    <span>{ROLE_ICONS[h.toRole]} {h.toRole.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1e293b] bg-[#090f1d] px-4 py-2.5 text-xs text-slate-400 flex items-center justify-between font-terminal">
          <span>Prioritas: {task.priority.toUpperCase()} | Revisi: {task.revisionCount}x</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-slate-800 px-3 py-1 text-slate-200 hover:bg-slate-700"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};
