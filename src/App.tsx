import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CompanyTask, EmployeeRole, TaskPriority, ActivityLog } from './types/company';
import { createInitialTask, advanceTaskStep, abortTask } from './sim/taskWorkflow';
import { INITIAL_EMPLOYEES, ROLE_ICONS } from './sim/employeesData';
import { Header } from './components/Header';
import { OfficeCanvas } from './components/OfficeCanvas';
import { CeoCommandPanel } from './components/CeoCommandPanel';
import { EmployeeRoster } from './components/EmployeeRoster';
import { CompanyLog } from './components/CompanyLog';
import { TaskDetailModal } from './components/TaskDetailModal';
import { EmployeeProfileModal } from './components/EmployeeProfileModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import {
  isAudioEnabled,
  toggleAudio,
  playCompleteFanfare,
  playRevisionAlert,
  playTypingSound,
  playClickSound,
} from './sim/sound';

export default function App() {
  const [isAiLive, setIsAiLive] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<CompanyTask | null>(null);
  const [taskHistory, setTaskHistory] = useState<CompanyTask[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);

  // Modal and focus state
  const [selectedRole, setSelectedRole] = useState<EmployeeRole | null>(null);
  const [inspectingTask, setInspectingTask] = useState<CompanyTask | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Animation handover state
  const [pendingHandover, setPendingHandover] = useState<{
    from: EmployeeRole;
    to: EmployeeRole;
    id: string;
  } | null>(null);

  const isExecutingWorkerRef = useRef<boolean>(false);
  const currentTaskRef = useRef<CompanyTask | null>(null);

  useEffect(() => {
    currentTaskRef.current = currentTask;
  }, [currentTask]);

  // Helper to add toast
  const addToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-3), { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  // Helper to add log
  const addLog = useCallback(
    (message: string, actor: string = 'CEO', type: ActivityLog['type'] = 'system', role?: EmployeeRole) => {
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newLog: ActivityLog = {
        id: 'log-' + Math.random().toString(36).substring(2, 9),
        timestamp: now,
        type,
        actor,
        message,
        role,
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    },
    []
  );

  // 1. Check Backend AI Status on Mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setIsAiLive(Boolean(data.aiAvailable));
        addLog(
          data.aiAvailable
            ? 'Terhubung ke server Gemini AI (gemini-3.8-flash aktif).'
            : 'Server berjalan dalam Mode Simulasi Perusahaan (SIMULASI).',
          'SISTEM',
          'system'
        );
      })
      .catch(() => {
        setIsAiLive(false);
        addLog('Mode simulasi lokal diaktifkan.', 'SISTEM', 'system');
      });

    // Seed default welcome task in history so CEO can inspect immediately
    const sampleSeedTask = createInitialTask('Buat rancangan portal e-commerce modern', 'normal');
    sampleSeedTask.status = 'selesai';
    sampleSeedTask.finalDeliverable = `# LAPORAN SELESAI: Portal E-Commerce Modern
Departemen Terkait: PM, Riset, Desain, Penulisan, Dev, QA, Reviewer
Hasil: Terverifikasi siap rilis dengan standar mutu 98/100.`;
    setTaskHistory([sampleSeedTask]);
  }, [addLog]);

  // Execute AI Worker Step on backend
  const executeWorkerStep = useCallback(
    async (task: CompanyTask) => {
      if (isExecutingWorkerRef.current || isPaused) return;
      isExecutingWorkerRef.current = true;

      const currentStep = task.steps[task.currentStepIndex];
      if (!currentStep) {
        isExecutingWorkerRef.current = false;
        return;
      }

      addLog(
        `Karyawan [${currentStep.role.toUpperCase()}] mulai mengerjakan: "${currentStep.title}"`,
        currentStep.role,
        'start',
        currentStep.role
      );
      playTypingSound();

      try {
        const previousOutputs = task.steps
          .slice(0, task.currentStepIndex)
          .filter((s) => Boolean(s.output))
          .map((s) => ({ role: s.role, title: s.title, output: s.output || '' }));

        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch('/api/worker/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            role: currentStep.role,
            prompt: task.prompt,
            taskTitle: task.title,
            previousOutputs,
            revisionNotes: task.reviewFeedback,
          }),
        });

        clearTimeout(fetchTimeout);
        const data = await response.json();

        // Advance task state machine
        const advanceResult = advanceTaskStep(
          task,
          data.output || 'Pekerjaan selesai diproses.',
          data.notes || '',
          data.decision || 'APPROVED'
        );

        setCurrentTask(advanceResult.nextTask);
        currentTaskRef.current = advanceResult.nextTask;

        if (advanceResult.isRevision) {
          // Reviewer triggered revision!
          playRevisionAlert();
          addToast(
            '⚠️ REVISI DIMINTA',
            `Auditor meminta perbaikan: "${data.notes || 'Perbaiki hasil kerja'}"`,
            'warning'
          );
          addLog(
            `Reviewer menolak dan meminta revisi kepada Developer: ${data.notes || ''}`,
            'Reviewer',
            'revision',
            'reviewer'
          );

          if (advanceResult.handover) {
            setPendingHandover({
              from: advanceResult.handover.fromRole,
              to: advanceResult.handover.toRole,
              id: 'rev-' + Date.now(),
            });
          }
        } else if (advanceResult.isComplete) {
          // Task completed!
          playCompleteFanfare();
          addToast('🎉 TUGAS SELESAI!', `Dossier lengkap "${advanceResult.nextTask.title}" diserahkan ke CEO.`, 'success');
          addLog(
            `Tugas "${advanceResult.nextTask.title}" selesai 100%! Berkas diserahkan ke meja CEO.`,
            'Reviewer',
            'complete',
            'reviewer'
          );
          setTaskHistory((prev) => [advanceResult.nextTask, ...prev]);
        } else {
          // Normal advance: trigger next file handover animation
          if (advanceResult.handover) {
            addToast(
              '📁 SERAH TERIMA BERKAS',
              `${advanceResult.handover.fromRole.toUpperCase()} ➜ ${advanceResult.handover.toRole.toUpperCase()}`,
              'handover'
            );
            addLog(
              advanceResult.handover.reason,
              advanceResult.handover.fromRole,
              'handover',
              advanceResult.handover.fromRole
            );

            setPendingHandover({
              from: advanceResult.handover.fromRole,
              to: advanceResult.handover.toRole,
              id: 'ho-' + Date.now(),
            });
          }
        }
      } catch (err) {
        console.warn('Worker step execution error or timeout, advancing via fast fallback:', err);
        addLog(
          `Mitigasi aktif: Tahap ${currentStep.role.toUpperCase()} diselesaikan melalui jalur respons cepat.`,
          currentStep.role,
          'complete',
          currentStep.role
        );

        // Fallback advance so the company workflow NEVER stalls
        const fallbackText = `Dokumen ${currentStep.title} telah selesai diproses untuk "${task.title}". Analisis data dan kebutuhan teknis berhasil divalidasi.`;
        const advanceResult = advanceTaskStep(
          task,
          fallbackText,
          'Diproses via sistem mitigasi cepat INTI',
          'APPROVED'
        );

        setCurrentTask(advanceResult.nextTask);
        currentTaskRef.current = advanceResult.nextTask;

        if (advanceResult.isComplete) {
          playCompleteFanfare();
          addToast('🎉 TUGAS SELESAI!', `Dossier lengkap "${advanceResult.nextTask.title}" diserahkan ke CEO.`, 'success');
          setTaskHistory((prev) => [advanceResult.nextTask, ...prev]);
        } else if (advanceResult.handover) {
          addToast(
            '📁 SERAH TERIMA BERKAS',
            `${advanceResult.handover.fromRole.toUpperCase()} ➜ ${advanceResult.handover.toRole.toUpperCase()}`,
            'handover'
          );
          setPendingHandover({
            from: advanceResult.handover.fromRole,
            to: advanceResult.handover.toRole,
            id: 'ho-' + Date.now(),
          });
        }
      } finally {
        isExecutingWorkerRef.current = false;
      }
    },
    [isPaused, addLog, addToast]
  );

  // Trigger worker execution when handover finishes
  const handleHandoverComplete = useCallback(
    (from: EmployeeRole, to: EmployeeRole) => {
      setPendingHandover(null);
      const activeTask = currentTaskRef.current;
      if (activeTask && (activeTask.status === 'dikerjakan' || activeTask.status === 'revisi' || activeTask.status === 'menunggu_pemeriksaan') && !isPaused) {
        // Run the current assignee's work
        executeWorkerStep(activeTask);
      }
    },
    [isPaused, executeWorkerStep]
  );

  // CEO Creates New Task
  const handleCreateTask = (prompt: string, priority: TaskPriority) => {
    const newTask = createInitialTask(prompt, priority);
    setCurrentTask(newTask);

    addToast('👑 PERINTAH CEO DITERIMA', `Tugas "${newTask.title}" didistribusikan ke tim.`, 'info');
    addLog(`CEO memberikan instruksi baru: "${prompt}" (Prioritas: ${priority})`, 'CEO', 'order', 'ceo');

    // Trigger visual handover: CEO walks/sends dossier to PM
    setPendingHandover({
      from: 'ceo',
      to: 'pm',
      id: 'ho-init-' + Date.now(),
    });
  };

  // CEO Aborts Active Task
  const handleAbortTask = () => {
    if (!currentTask) return;
    const aborted = abortTask(currentTask, 'Perintah dibatalkan langsung oleh CEO.');
    setCurrentTask(aborted);
    setPendingHandover(null);
    setTaskHistory((prev) => [aborted, ...prev]);
    addToast('🛑 TUGAS DIHENTIKAN', `Tugas ${aborted.id} telah dibatalkan oleh CEO.`, 'warning');
    addLog(`Tugas ${aborted.id} dibatalkan oleh CEO. Seluruh aktivitas disetop.`, 'CEO', 'system', 'ceo');
  };

  // Give cheer / coffee break to employee
  const handleCheerEmployee = (role: EmployeeRole) => {
    const emp = INITIAL_EMPLOYEES.find((e) => e.role === role);
    if (!emp) return;
    addToast('☕ APRESIASI CEO', `CEO memberikan semangat dan kopi kepada ${emp.name}!`, 'success');
    addLog(`CEO memberikan apresiasi kopi kepada ${emp.name} (${emp.title}).`, 'CEO', 'system', role);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Header with Controls */}
      <Header
        isAiLive={isAiLive}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        simSpeed={simSpeed}
        onChangeSpeed={(s) => setSimSpeed(s)}
        isSoundOn={isSoundOn}
        onToggleSound={() => {
          const newState = toggleAudio();
          setIsSoundOn(newState);
        }}
      />

      {/* 2. Main Content Container */}
      <main className="mx-auto flex-1 w-full max-w-7xl p-3 sm:p-5 space-y-4">
        {/* Living Pixel Office 2D Canvas (The Hero Element) */}
        <section aria-label="Kantor 2D Pixel Art INTI">
          <OfficeCanvas
            currentTask={currentTask}
            selectedEmployeeRole={selectedRole}
            onSelectEmployee={(role) => setSelectedRole(role)}
            isPaused={isPaused}
            simSpeed={simSpeed}
            onHandoverComplete={handleHandoverComplete}
            pendingHandover={pendingHandover}
          />
        </section>

        {/* CEO Command Panel ("Apa yang ingin kamu buat hari ini?") */}
        <section aria-label="Panel Perintah CEO">
          <CeoCommandPanel
            currentTask={currentTask}
            taskHistory={taskHistory}
            onCreateTask={handleCreateTask}
            onAbortTask={handleAbortTask}
            onOpenTaskDetails={(task) => setInspectingTask(task)}
            aiAvailable={isAiLive}
          />
        </section>

        {/* Living Pixel Employees Roster & Status Grid */}
        <section aria-label="Daftar Karyawan">
          <EmployeeRoster
            currentTask={currentTask}
            selectedRole={selectedRole}
            onSelectEmployee={(role) => setSelectedRole(role)}
            pendingHandoverRole={pendingHandover?.from}
          />
        </section>

        {/* Real-Time Company Activity Log */}
        <section aria-label="Log Aktivitas Perusahaan">
          <CompanyLog logs={logs} onClearLogs={() => setLogs([])} />
        </section>
      </main>

      {/* 3. Footer */}
      <footer className="border-t-2 border-[#162033] bg-[#050810] py-3 text-center font-terminal text-xs text-slate-500">
        INTI — Pixel AI Company Simulator © 2026. Didukung oleh 16-Bit Engine & Google Gemini AI.
      </footer>

      {/* 4. Modals */}
      {inspectingTask && (
        <TaskDetailModal task={inspectingTask} onClose={() => setInspectingTask(null)} />
      )}

      {selectedRole && (
        <EmployeeProfileModal
          role={selectedRole}
          currentTask={currentTask}
          onClose={() => setSelectedRole(null)}
          onCheer={handleCheerEmployee}
        />
      )}

      {/* 5. Notification Toast Stack */}
      <NotificationToast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}
