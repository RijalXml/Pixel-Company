import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CompanyTask, EmployeeInfo, EmployeeRole } from '../types/company';
import { INITIAL_EMPLOYEES, ROLE_ICONS } from '../sim/employeesData';
import {
  drawOfficeDecorations,
  drawPixelEmployee,
  drawWorkstationDesk,
  drawPixelRect,
} from '../sim/pixelSprites';
import { playHandoverSound } from '../sim/sound';

interface OfficeCanvasProps {
  currentTask: CompanyTask | null;
  selectedEmployeeRole: EmployeeRole | null;
  onSelectEmployee: (role: EmployeeRole) => void;
  isPaused: boolean;
  simSpeed: number; // 1, 2, 4
  onHandoverComplete?: (from: EmployeeRole, to: EmployeeRole) => void;
  pendingHandover: { from: EmployeeRole; to: EmployeeRole; id: string } | null;
}

interface WalkingActor {
  role: EmployeeRole;
  currentX: number;
  currentY: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  facing: 'left' | 'right' | 'down' | 'up';
  action: 'idle' | 'walking' | 'carrying' | 'handing' | 'receiving' | 'typing';
  isReturning: boolean;
  progress: number;
}

export const OfficeCanvas: React.FC<OfficeCanvasProps> = ({
  currentTask,
  selectedEmployeeRole,
  onSelectEmployee,
  isPaused,
  simSpeed,
  onHandoverComplete,
  pendingHandover,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [employees, setEmployees] = useState<EmployeeInfo[]>(INITIAL_EMPLOYEES);
  const [activeCarrier, setActiveCarrier] = useState<WalkingActor | null>(null);
  const [handoverBanner, setHandoverBanner] = useState<string | null>(null);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Reference coordinates for desks
  const deskMap = useRef<Record<EmployeeRole, { x: number; y: number }>>({
    ceo: { x: 160, y: 130 },
    pm: { x: 360, y: 130 },
    researcher: { x: 560, y: 130 },
    designer: { x: 740, y: 130 },
    developer: { x: 160, y: 310 },
    writer: { x: 360, y: 310 },
    qa: { x: 560, y: 310 },
    reviewer: { x: 740, y: 310 },
  });

  // Start handover animation when pendingHandover triggers
  useEffect(() => {
    if (!pendingHandover) return;
    const { from, to } = pendingHandover;
    const fromPos = deskMap.current[from];
    const toPos = deskMap.current[to];

    if (!fromPos || !toPos) return;

    const bannerMsg = `OPER BERKAS: ${from.toUpperCase()} (${ROLE_ICONS[from]}) ➜ ${to.toUpperCase()} (${ROLE_ICONS[to]})`;
    setHandoverBanner(bannerMsg);

    // Initial carrier standing up from desk
    setActiveCarrier({
      role: from,
      currentX: fromPos.x,
      currentY: fromPos.y + 10,
      startX: fromPos.x,
      startY: fromPos.y + 10,
      targetX: toPos.x - 30,
      targetY: toPos.y + 10,
      facing: toPos.x >= fromPos.x ? 'right' : 'left',
      action: 'carrying',
      isReturning: false,
      progress: 0,
    });
  }, [pendingHandover]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let animId: number;

    const render = (time: number) => {
      if (!isPaused) {
        frameRef.current += 1 * simSpeed;
      }
      const frame = Math.floor(frameRef.current);

      // Canvas dimensions
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Office Background & Decor
      drawOfficeDecorations(ctx, width, height, frame);

      // 2. Draw Desks
      employees.forEach((emp) => {
        const isCurrentActive = currentTask && currentTask.currentAssignee === emp.role && currentTask.status === 'dikerjakan';
        let screenType: 'code' | 'palette' | 'document' | 'chart' | 'test' | 'audit' | 'ceo' = 'code';
        if (emp.role === 'developer') screenType = 'code';
        else if (emp.role === 'designer') screenType = 'palette';
        else if (emp.role === 'researcher' || emp.role === 'pm') screenType = 'chart';
        else if (emp.role === 'qa') screenType = 'test';
        else if (emp.role === 'reviewer') screenType = 'audit';
        else if (emp.role === 'ceo') screenType = 'ceo';
        else screenType = 'document';

        const displayName = emp.role === 'researcher' ? 'Dr. Aris' : emp.name.split(' ')[0];
        drawWorkstationDesk(
          ctx,
          emp.deskX,
          emp.deskY,
          `[${emp.role.toUpperCase()}] ${displayName}`,
          screenType,
          Boolean(isCurrentActive),
          frame
        );
      });

      // 3. Update Carrier Movement during handover
      let carrier = activeCarrier;
      if (carrier && !isPaused) {
        const speed = 0.015 * simSpeed;
        carrier.progress += speed;

        if (!carrier.isReturning) {
          // Phase 1: Moving to destination desk
          if (carrier.progress < 1) {
            carrier.currentX = carrier.startX + (carrier.targetX - carrier.startX) * carrier.progress;
            carrier.currentY = carrier.startY + (carrier.targetY - carrier.startY) * carrier.progress;
            carrier.action = 'carrying';
          } else if (carrier.progress >= 1 && carrier.progress < 1.3) {
            // Phase 2: Handing over at destination desk
            carrier.currentX = carrier.targetX;
            carrier.currentY = carrier.targetY;
            carrier.action = 'handing';

            // Sparkles and handover sound
            if (Math.floor(carrier.progress * 100) % 15 === 0) {
              playHandoverSound();
            }
          } else if (carrier.progress >= 1.3) {
            // Complete hand-off to recipient, begin returning home
            carrier.isReturning = true;
            carrier.startX = carrier.targetX;
            carrier.startY = carrier.targetY;
            const homePos = deskMap.current[carrier.role];
            carrier.targetX = homePos.x;
            carrier.targetY = homePos.y + 10;
            carrier.progress = 0;
            carrier.facing = carrier.targetX >= carrier.startX ? 'right' : 'left';
            carrier.action = 'walking';

            if (pendingHandover && onHandoverComplete) {
              onHandoverComplete(pendingHandover.from, pendingHandover.to);
            }
          }
        } else {
          // Returning back to home desk
          if (carrier.progress < 1) {
            carrier.currentX = carrier.startX + (carrier.targetX - carrier.startX) * carrier.progress;
            carrier.currentY = carrier.startY + (carrier.targetY - carrier.startY) * carrier.progress;
            carrier.action = 'walking';
          } else {
            // Reached home desk!
            carrier = null;
            setActiveCarrier(null);
            setHandoverBanner(null);
          }
        }
      }

      // 4. Draw Employees
      employees.forEach((emp) => {
        // If this employee is currently walking/carrying the file, draw carrier sprite instead
        if (carrier && carrier.role === emp.role) {
          drawPixelEmployee({
            ctx,
            x: carrier.currentX,
            y: carrier.currentY,
            skinColor: emp.skinColor,
            hairColor: emp.hairColor,
            shirtColor: emp.shirtColor,
            pantsColor: emp.pantsColor,
            action: carrier.action,
            facing: carrier.facing,
            frame,
            carryingDoc: carrier.action === 'carrying' || carrier.action === 'handing',
            name: emp.name,
            roleTitle: emp.title,
            bubbleIcon: carrier.action === 'handing' ? '🤝' : '📁',
            bubbleText: carrier.action === 'handing' ? 'Serah berkas!' : 'Membawa berkas',
            isSelected: selectedEmployeeRole === emp.role,
          });
          return;
        }

        // Sitting at desk
        const isCurrentWorker = currentTask && currentTask.currentAssignee === emp.role && currentTask.status !== 'selesai';
        const isRecipient = carrier && !carrier.isReturning && carrier.progress >= 0.8 && pendingHandover?.to === emp.role;

        let action: 'idle' | 'typing' | 'walking' | 'carrying' | 'handing' | 'receiving' = 'idle';
        let bubbleIcon: string | null = null;
        let bubbleText: string | null = null;

        if (isRecipient) {
          action = 'receiving';
          bubbleIcon = '📥';
          bubbleText = 'Menerima berkas!';
        } else if (isCurrentWorker) {
          action = 'typing';
          if (emp.role === 'developer') {
            bubbleIcon = '💻';
            bubbleText = 'Coding...';
          } else if (emp.role === 'designer') {
            bubbleIcon = '🎨';
            bubbleText = 'Desain UI...';
          } else if (emp.role === 'researcher') {
            bubbleIcon = '🔍';
            bubbleText = 'Riset data...';
          } else if (emp.role === 'writer') {
            bubbleIcon = '✍️';
            bubbleText = 'Menulis copy...';
          } else if (emp.role === 'qa') {
            bubbleIcon = '🧪';
            bubbleText = 'Menguji bug...';
          } else if (emp.role === 'reviewer') {
            bubbleIcon = '⚖️';
            bubbleText = 'Audit mutu...';
          } else if (emp.role === 'pm') {
            bubbleIcon = '📋';
            bubbleText = 'Atur sprint...';
          } else {
            bubbleIcon = '👑';
            bubbleText = 'Memeriksa...';
          }
        }

        drawPixelEmployee({
          ctx,
          x: emp.deskX,
          y: emp.deskY - 8,
          skinColor: emp.skinColor,
          hairColor: emp.hairColor,
          shirtColor: emp.shirtColor,
          pantsColor: emp.pantsColor,
          action,
          facing: 'down',
          frame,
          carryingDoc: false,
          name: emp.name,
          roleTitle: emp.title,
          bubbleIcon,
          bubbleText,
          isSelected: selectedEmployeeRole === emp.role,
        });
      });

      // 5. Draw Handover HUD Overlay Banner if active
      if (handoverBanner) {
        ctx.save();
        const bannerW = 420;
        const bannerH = 26;
        const bx = (width - bannerW) / 2;
        const by = 16;

        drawPixelRect(ctx, bx, by, bannerW, bannerH, 'rgba(13, 19, 38, 0.95)');
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bannerW, bannerH);

        // Blinking gold dot
        if (frame % 20 < 10) {
          drawPixelRect(ctx, bx + 10, by + 8, 8, 8, '#ffd166');
        }

        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = '#00e5ff';
        ctx.textAlign = 'center';
        ctx.fillText(handoverBanner, width / 2 + 6, by + 17);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [employees, activeCarrier, isPaused, simSpeed, selectedEmployeeRole, currentTask, pendingHandover, onHandoverComplete, handoverBanner]);

  // Click on canvas to select employee or interact
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check click near employee or desk
    let clickedRole: EmployeeRole | null = null;
    employees.forEach((emp) => {
      const dist = Math.hypot(clickX - emp.deskX, clickY - emp.deskY);
      if (dist < 42) {
        clickedRole = emp.role;
      }
    });

    if (clickedRole) {
      onSelectEmployee(clickedRole);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border-4 border-[#1e293b] bg-[#090d16] shadow-2xl">
      {/* Top Retro Canvas Bar */}
      <div className="flex items-center justify-between border-b-2 border-[#1e293b] bg-[#0d1326] px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-cyan-400"></span>
          <span className="font-pixel text-[10px] text-cyan-300">KANTOR 2D INTI CORP</span>
          <span className="hidden font-terminal text-sm text-slate-400 sm:inline">| 16-BIT RETRO SIMULATOR</span>
        </div>
        <div className="flex items-center gap-3">
          {currentTask && (
            <span className="rounded bg-cyan-950/80 px-2 py-0.5 font-terminal text-xs text-cyan-300 border border-cyan-800">
              Tugas Aktif: {currentTask.id}
            </span>
          )}
          <span className="font-terminal text-xs text-slate-400">
            {isPaused ? '⏸️ JEDA' : `▶️ KECEPATAN: ${simSpeed}X`}
          </span>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative flex items-center justify-center p-1 sm:p-2 bg-[#090d16]">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          onClick={handleCanvasClick}
          className="pixelated w-full h-auto max-h-[500px] cursor-pointer object-contain rounded border border-[#162035]"
          title="Klik pada karyawan atau meja untuk melihat profil dan berkas"
        />

        {/* Scanlines overlay effect */}
        <div className="scanlines absolute inset-0 rounded pointer-events-none opacity-40"></div>
      </div>

      {/* Quick Office Legend / Guide */}
      <div className="flex flex-wrap items-center justify-between border-t border-[#1e293b] bg-[#0c1222] px-3 py-1.5 text-[11px] text-slate-400 font-terminal">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-0.5">
          <span>👑 CEO</span>
          <span>📋 PM</span>
          <span>🔍 Riset</span>
          <span>🎨 Desain</span>
          <span>💻 Dev</span>
          <span>✍️ Writer</span>
          <span>🧪 QA</span>
          <span>⚖️ Reviewer</span>
        </div>
        <span className="hidden md:inline text-cyan-400/80">
          💡 Tips: Klik karyawan/meja untuk melihat aktivitas & detail pekerjaan
        </span>
      </div>
    </div>
  );
};
