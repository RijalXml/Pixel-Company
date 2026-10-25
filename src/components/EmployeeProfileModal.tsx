import React from 'react';
import { EmployeeInfo, EmployeeRole, CompanyTask } from '../types/company';
import { INITIAL_EMPLOYEES, ROLE_ICONS, ROLE_BADGE_COLORS } from '../sim/employeesData';
import { X, Award, CheckCircle2, MessageSquare } from 'lucide-react';
import { playClickSound } from '../sim/sound';

interface EmployeeProfileModalProps {
  role: EmployeeRole;
  currentTask: CompanyTask | null;
  onClose: () => void;
  onCheer: (role: EmployeeRole) => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  role,
  currentTask,
  onClose,
  onCheer,
}) => {
  const employee = INITIAL_EMPLOYEES.find((e) => e.role === role) || INITIAL_EMPLOYEES[0];
  const badge = ROLE_BADGE_COLORS[role];
  const isCurrentAssignee = currentTask && currentTask.currentAssignee === role;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border-4 border-[#243557] bg-[#0c1324] p-5 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute right-3 top-3 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 border-b border-[#1f2d47] pb-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-cyan-400 text-3xl shadow-lg"
            style={{ backgroundColor: employee.shirtColor + '44' }}
          >
            {ROLE_ICONS[role]}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-pixel text-sm text-slate-100">{employee.name}</h3>
              <span className={`rounded px-2 py-0.5 font-terminal text-xs uppercase border ${badge.bg} ${badge.text} ${badge.border}`}>
                {employee.role}
              </span>
            </div>
            <p className="font-terminal text-sm text-cyan-300">{employee.title}</p>
            <p className="mt-1 font-terminal text-xs text-slate-400">Desk Coord: [{employee.deskX}, {employee.deskY}]</p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-3 font-sans text-xs">
          <div>
            <span className="font-pixel text-[10px] text-slate-400">Spesialisasi & Tanggung Jawab:</span>
            <p className="mt-1 rounded bg-[#070b16] p-2.5 text-slate-200 border border-[#172238]">
              {employee.specialty}
            </p>
          </div>

          <div>
            <span className="font-pixel text-[10px] text-slate-400">Status Tugas Aktif:</span>
            <div className="mt-1 rounded bg-[#070b16] p-2.5 border border-[#172238]">
              {isCurrentAssignee ? (
                <div className="flex items-center gap-2 text-cyan-300 font-terminal text-sm">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Sedang mengerjakan: &quot;{currentTask.title}&quot;</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 font-terminal text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Stanby di workstation, menunggu berkas tugas masuk</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onCheer(role);
            }}
            className="flex-1 rounded-lg border-2 border-amber-400 bg-amber-950/80 py-2 font-pixel text-xs text-amber-200 hover:bg-amber-900 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
          >
            <Award className="h-4 w-4" />
            <span>Beri Apresiasi! ☕</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-terminal text-sm text-slate-300 hover:bg-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
