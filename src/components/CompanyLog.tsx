import React from 'react';
import { ActivityLog } from '../types/company';
import { ROLE_ICONS } from '../sim/employeesData';
import { Terminal, Trash2 } from 'lucide-react';
import { playClickSound } from '../sim/sound';

interface CompanyLogProps {
  logs: ActivityLog[];
  onClearLogs?: () => void;
}

export const CompanyLog: React.FC<CompanyLogProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="rounded-xl border-4 border-[#1e293b] bg-[#0c1322] p-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="font-pixel text-xs text-emerald-300">LOG AKTIVITAS KANTOR (REAL-TIME)</span>
        </div>
        {onClearLogs && (
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClearLogs();
            }}
            className="flex items-center gap-1 font-terminal text-xs text-slate-400 hover:text-slate-200"
            title="Bersihkan Log"
          >
            <Trash2 className="h-3 w-3" />
            <span>Bersihkan</span>
          </button>
        )}
      </div>

      <div className="mt-3 max-h-56 overflow-y-auto space-y-1.5 pr-1 font-terminal text-xs">
        {logs.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            Belum ada aktivitas. Berikan perintah melalui Panel CEO untuk memulai!
          </div>
        ) : (
          logs.map((log) => {
            let badgeColor = 'text-slate-400';
            if (log.type === 'handover') badgeColor = 'text-cyan-400';
            else if (log.type === 'complete') badgeColor = 'text-emerald-400';
            else if (log.type === 'revision') badgeColor = 'text-amber-400';
            else if (log.type === 'order') badgeColor = 'text-purple-400';

            return (
              <div
                key={log.id}
                className="flex items-start gap-2 rounded border border-[#162033] bg-[#080d1a] px-2.5 py-1.5 hover:bg-[#0a1224]"
              >
                <span className="shrink-0 text-slate-500 font-mono text-[11px]">
                  [{log.timestamp}]
                </span>
                <span className={`shrink-0 font-pixel text-[10px] ${badgeColor}`}>
                  {log.role ? ROLE_ICONS[log.role] : '⚡'} [{log.actor.toUpperCase()}]:
                </span>
                <span className="text-slate-300 flex-1 break-words">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
