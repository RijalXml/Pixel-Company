import React from 'react';
import { EmployeeInfo, EmployeeRole, CompanyTask } from '../types/company';
import { INITIAL_EMPLOYEES, ROLE_BADGE_COLORS, ROLE_ICONS } from '../sim/employeesData';
import { playClickSound } from '../sim/sound';

interface EmployeeRosterProps {
  currentTask: CompanyTask | null;
  selectedRole: EmployeeRole | null;
  onSelectEmployee: (role: EmployeeRole) => void;
  pendingHandoverRole?: EmployeeRole | null;
}

export const EmployeeRoster: React.FC<EmployeeRosterProps> = ({
  currentTask,
  selectedRole,
  onSelectEmployee,
  pendingHandoverRole,
}) => {
  return (
    <div className="rounded-xl border-4 border-[#1e293b] bg-[#0c1322] p-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-xs text-purple-300">TIM KARYAWAN INTI</span>
          <span className="rounded bg-slate-800 px-1.5 py-0.2 font-terminal text-xs text-slate-400">
            {INITIAL_EMPLOYEES.length} Anggota
          </span>
        </div>
        <span className="font-terminal text-xs text-slate-400">Status & Spesialisasi</span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {INITIAL_EMPLOYEES.map((emp) => {
          const isSelected = selectedRole === emp.role;
          const isCurrentActive =
            currentTask &&
            currentTask.currentAssignee === emp.role &&
            currentTask.status !== 'selesai' &&
            currentTask.status !== 'gagal';
          const isCarrying = pendingHandoverRole === emp.role;
          const badge = ROLE_BADGE_COLORS[emp.role];

          let activityStatus = 'Siap di meja';
          if (isCarrying) {
            activityStatus = 'Mengoper berkas 📁';
          } else if (isCurrentActive) {
            if (emp.role === 'developer') activityStatus = 'Menulis kode 💻';
            else if (emp.role === 'designer') activityStatus = 'Merancang UI 🎨';
            else if (emp.role === 'researcher') activityStatus = 'Menganalisis riset 🔍';
            else if (emp.role === 'writer') activityStatus = 'Menyusun copy ✍️';
            else if (emp.role === 'qa') activityStatus = 'Menguji bug 🧪';
            else if (emp.role === 'reviewer') activityStatus = 'Audit kelayakan ⚖️';
            else if (emp.role === 'pm') activityStatus = 'Menyusun rencana 📋';
            else activityStatus = 'Evaluasi eksekutif 👑';
          }

          return (
            <div
              key={emp.id}
              onClick={() => {
                playClickSound();
                onSelectEmployee(emp.role);
              }}
              className={`cursor-pointer rounded-lg border-2 p-2.5 transition-all ${
                isSelected
                  ? 'border-cyan-400 bg-[#101b33] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                  : 'border-[#1b263b] bg-[#090f1e] hover:border-slate-600 hover:bg-[#0c1428]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Employee Pixel Avatar Preview */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[#243555] text-xl shadow"
                  style={{ backgroundColor: emp.shirtColor + '33' }}
                >
                  {ROLE_ICONS[emp.role]}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-[11px] font-bold text-slate-100 truncate">
                      {emp.role === 'researcher' ? 'Dr. Aris' : emp.name.split(' ')[0]}
                    </span>
                    <span className={`rounded px-1.5 py-0.2 font-terminal text-[10px] uppercase border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {emp.role}
                    </span>
                  </div>
                  <p className="font-terminal text-xs text-slate-400 truncate">{emp.title}</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-2 flex items-center justify-between border-t border-[#18233a] pt-1.5 font-terminal text-xs">
                <span className="text-slate-500">Aktivitas:</span>
                <span
                  className={`font-semibold ${
                    isCarrying
                      ? 'text-amber-300 animate-pulse'
                      : isCurrentActive
                      ? 'text-cyan-400 font-bold animate-pulse'
                      : 'text-slate-400'
                  }`}
                >
                  {activityStatus}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
