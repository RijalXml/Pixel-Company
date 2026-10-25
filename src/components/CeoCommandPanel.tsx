import React, { useState } from 'react';
import { CompanyTask, TaskPriority } from '../types/company';
import { ROLE_ICONS } from '../sim/employeesData';
import { Send, Square, Sparkles, History, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { playClickSound } from '../sim/sound';

interface CeoCommandPanelProps {
  currentTask: CompanyTask | null;
  taskHistory: CompanyTask[];
  onCreateTask: (prompt: string, priority: TaskPriority) => void;
  onAbortTask: () => void;
  onOpenTaskDetails: (task: CompanyTask) => void;
  aiAvailable: boolean;
}

const QUICK_EXAMPLES = [
  'Buat website toko pakaian retro',
  'Analisis ide bisnis AI Customer Service',
  'Buat desain poster promosi kopi artisan',
  'Buat aplikasi kalkulator cerdas TypeScript',
  'Rancang kampanye peluncuran aplikasi mobile',
];

export const CeoCommandPanel: React.FC<CeoCommandPanelProps> = ({
  currentTask,
  taskHistory,
  onCreateTask,
  onAbortTask,
  onOpenTaskDetails,
  aiAvailable,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    playClickSound();
    onCreateTask(promptInput.trim(), priority);
    setPromptInput('');
  };

  const handleSelectExample = (example: string) => {
    playClickSound();
    setPromptInput(example);
  };

  const isWorking = currentTask && currentTask.status === 'dikerjakan';

  return (
    <div className="rounded-xl border-4 border-[#1e293b] bg-[#0c1322] p-4 shadow-xl">
      {/* Title & CEO Identification */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-amber-400 bg-amber-950/60 text-xl shadow-lg">
            👑
          </div>
          <div>
            <h2 className="font-pixel text-sm text-amber-300 sm:text-base">
              Apa yang ingin kamu buat hari ini?
            </h2>
            <p className="font-terminal text-sm text-slate-400">
              Panel Komando CEO INTI — Beri perintah dan pantau pengerjaan tim
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setShowHistory(!showHistory);
            }}
            className="flex items-center gap-1.5 rounded border border-[#2e3b55] bg-[#141d33] px-3 py-1.5 font-terminal text-sm text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
          >
            <History className="h-4 w-4" />
            <span>Riwayat ({taskHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="relative">
          <textarea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Tuliskan perintah bebas untuk seluruh tim perusahaan... (contoh: 'Buat website toko pakaian modern dengan keranjang belanja')"
            rows={3}
            className="w-full resize-none rounded-lg border-2 border-[#1e293b] bg-[#080d1a] p-3 font-sans text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Quick Example Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="font-terminal text-xs text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-cyan-400" /> Contoh:
          </span>
          {QUICK_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectExample(ex)}
              className="rounded-md border border-[#1e2a42] bg-[#111a2f] px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-400 hover:bg-[#16223d] hover:text-cyan-200 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Action Controls & Priority */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="font-terminal text-sm text-slate-400">Prioritas:</span>
            <div className="flex rounded border border-[#1e293b] bg-[#090e1c] p-0.5">
              {(['normal', 'high', 'urgent'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setPriority(p);
                  }}
                  className={`rounded px-2.5 py-1 font-terminal text-xs transition-colors ${
                    priority === p
                      ? p === 'urgent'
                        ? 'bg-rose-600 text-white font-bold'
                        : p === 'high'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-cyan-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p === 'normal' ? 'Normal' : p === 'high' ? 'Tinggi' : 'Darurat 🔥'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Abort Task Button */}
            <button
              type="button"
              disabled={!isWorking}
              onClick={() => {
                playClickSound();
                onAbortTask();
              }}
              className={`flex items-center gap-1.5 rounded-lg border-2 px-4 py-2 font-pixel text-xs transition-all ${
                isWorking
                  ? 'border-rose-500 bg-rose-950/80 text-rose-200 hover:bg-rose-900 active:translate-y-0.5'
                  : 'cursor-not-allowed border-slate-700 bg-slate-800/40 text-slate-500'
              }`}
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>Hentikan Tugas</span>
            </button>

            {/* Submit / Create Task Button */}
            <button
              type="submit"
              disabled={!promptInput.trim()}
              className={`flex items-center gap-2 rounded-lg border-2 px-5 py-2 font-pixel text-xs shadow-lg transition-all ${
                promptInput.trim()
                  ? 'border-cyan-400 bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:brightness-110 active:translate-y-0.5'
                  : 'cursor-not-allowed border-slate-700 bg-slate-800/50 text-slate-500'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Buat Tugas</span>
            </button>
          </div>
        </div>
      </form>

      {/* Active Task Status Card */}
      {currentTask && (
        <div className="mt-4 rounded-lg border-2 border-cyan-800/60 bg-[#081224] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs text-cyan-300">{currentTask.id}</span>
              <span className="font-sans text-sm font-semibold text-slate-100">{currentTask.title}</span>
              <span
                className={`rounded px-2 py-0.5 font-terminal text-xs uppercase ${
                  currentTask.status === 'selesai'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : currentTask.status === 'revisi'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : currentTask.status === 'gagal'
                    ? 'bg-rose-950 text-rose-300 border border-rose-700'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-700 animate-pulse'
                }`}
              >
                {currentTask.status.replace('_', ' ')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onOpenTaskDetails(currentTask)}
              className="flex items-center gap-1 rounded border border-cyan-500/40 bg-cyan-950/50 px-2.5 py-1 font-terminal text-xs text-cyan-300 hover:bg-cyan-900"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Buka Dossier / Hasil</span>
            </button>
          </div>

          {/* Workflow Progress Bar */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between font-terminal text-xs text-slate-400 mb-1">
              <span>
                Sedang Dikerjakan: {ROLE_ICONS[currentTask.currentAssignee]} {currentTask.currentAssignee.toUpperCase()}
              </span>
              <span>
                Tahap {currentTask.currentStepIndex + 1} dari {currentTask.steps.length}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 transition-all duration-300"
                style={{
                  width: `${((currentTask.currentStepIndex + (currentTask.status === 'selesai' ? 1 : 0.5)) / currentTask.steps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Command History Drawer / Section */}
      {showHistory && (
        <div className="mt-4 border-t border-[#1e293b] pt-3">
          <h4 className="font-pixel text-xs text-slate-300 mb-2">Riwayat Perintah CEO:</h4>
          {taskHistory.length === 0 ? (
            <p className="font-terminal text-sm text-slate-500">Belum ada riwayat perintah.</p>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {taskHistory.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onOpenTaskDetails(t)}
                  className="flex cursor-pointer items-center justify-between rounded border border-[#1e293b] bg-[#090f1e] p-2 hover:border-cyan-500/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {t.status === 'selesai' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : t.status === 'gagal' ? (
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    )}
                    <div>
                      <span className="font-pixel text-[10px] text-cyan-400 mr-2">{t.id}</span>
                      <span className="font-sans text-xs text-slate-200">{t.title}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-terminal text-xs text-slate-400">{t.createdAt}</span>
                    <button
                      type="button"
                      className="rounded bg-slate-800 px-2 py-0.5 font-terminal text-xs text-cyan-300"
                    >
                      Lihat Hasil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
