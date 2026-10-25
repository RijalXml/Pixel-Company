import { CompanyTask, EmployeeRole, TaskPriority, WorkflowStep } from '../types/company';

let taskIdCounter = 100;

export function generateTaskId(): string {
  taskIdCounter += 1;
  return `#INTI-${taskIdCounter}`;
}

export const DEFAULT_PIPELINE_ROLES: EmployeeRole[] = [
  'pm',
  'researcher',
  'designer',
  'writer',
  'developer',
  'qa',
  'reviewer',
  'ceo',
];

export const ROLE_STEP_TITLES: Record<EmployeeRole, string> = {
  ceo: 'Pengesahan Akhir CEO',
  pm: 'Pembagian Tugas & Rencana Kerja',
  researcher: 'Riset Kebutuhan & Analisis',
  designer: 'Desain Visual & Antarmuka UI',
  writer: 'Penyusunan Copywriting & Panduan',
  developer: 'Implementasi Kode & Logika',
  qa: 'Pengujian Mutu & Verifikasi Bug',
  reviewer: 'Audit Kualitas & Verifikasi',
};

export function createInitialTask(
  prompt: string,
  priority: TaskPriority = 'normal',
  customTitle?: string
): CompanyTask {
  const id = generateTaskId();
  const title = customTitle || (prompt.length > 40 ? prompt.slice(0, 37) + '...' : prompt);
  const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const steps: WorkflowStep[] = [
    {
      role: 'pm',
      title: ROLE_STEP_TITLES.pm,
      description: 'Menyusun alur kerja spesifik, target deliverable, dan penugasan tim.',
      status: 'in_progress',
      startedAt: now,
    },
    {
      role: 'researcher',
      title: ROLE_STEP_TITLES.researcher,
      description: 'Mengumpulkan insight pasar, referensi kompetitor, dan spesifikasi.',
      status: 'pending',
    },
    {
      role: 'designer',
      title: ROLE_STEP_TITLES.designer,
      description: 'Merancang palet warna, layout UI, dan hierarki visual.',
      status: 'pending',
    },
    {
      role: 'writer',
      title: ROLE_STEP_TITLES.writer,
      description: 'Membuat narasi, salinan teks promosi, dan dokumentasi pengguna.',
      status: 'pending',
    },
    {
      role: 'developer',
      title: ROLE_STEP_TITLES.developer,
      description: 'Membangun komponen teknis, kode implementasi, dan modul fungsi.',
      status: 'pending',
    },
    {
      role: 'qa',
      title: ROLE_STEP_TITLES.qa,
      description: 'Menguji performa, memeriksa konsistensi, dan mensimulasikan edge-cases.',
      status: 'pending',
    },
    {
      role: 'reviewer',
      title: ROLE_STEP_TITLES.reviewer,
      description: 'Menilai kesesuaian hasil terhadap perintah awal CEO.',
      status: 'pending',
    },
    {
      role: 'ceo',
      title: ROLE_STEP_TITLES.ceo,
      description: 'Penyerahan dossier lengkap kepada CEO INTI.',
      status: 'pending',
    },
  ];

  return {
    id,
    title,
    prompt,
    priority,
    status: 'dikerjakan',
    currentAssignee: 'pm',
    currentStepIndex: 0,
    steps,
    createdAt: now,
    updatedAt: now,
    finalDeliverable: null,
    isAiPowered: true,
    revisionCount: 0,
    history: [
      {
        timestamp: now,
        fromRole: 'ceo',
        toRole: 'pm',
        message: `CEO menginstruksikan tugas baru: "${title}"`,
      },
    ],
  };
}

export interface StepAdvanceResult {
  nextTask: CompanyTask;
  handover: {
    fromRole: EmployeeRole;
    toRole: EmployeeRole;
    reason: string;
  } | null;
  isComplete: boolean;
  isRevision: boolean;
}

export function advanceTaskStep(
  task: CompanyTask,
  output: string,
  notes: string = '',
  reviewDecision: 'APPROVED' | 'REVISION' = 'APPROVED'
): StepAdvanceResult {
  const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const updatedSteps = [...task.steps];
  const currentIndex = task.currentStepIndex;
  const currentStep = updatedSteps[currentIndex];

  if (!currentStep) {
    return {
      nextTask: task,
      handover: null,
      isComplete: true,
      isRevision: false,
    };
  }

  // Update current step
  currentStep.status = 'completed';
  currentStep.output = output;
  currentStep.notes = notes;
  currentStep.completedAt = now;

  // Handle Reviewer Decision Branch
  if (currentStep.role === 'reviewer' && reviewDecision === 'REVISION' && task.revisionCount < 1) {
    // Branch to revision: send back to developer
    const devIndex = updatedSteps.findIndex((s) => s.role === 'developer');
    if (devIndex !== -1) {
      updatedSteps[devIndex].status = 'in_progress';
      updatedSteps[devIndex].notes = `[Revisi Reviewer]: ${notes || 'Perbaiki struktur kode dan konsistensi UI.'}`;

      // Reset subsequent steps
      for (let i = devIndex + 1; i <= currentIndex; i++) {
        updatedSteps[i].status = 'pending';
      }

      const nextTask: CompanyTask = {
        ...task,
        status: 'revisi',
        currentAssignee: 'developer',
        currentStepIndex: devIndex,
        steps: updatedSteps,
        updatedAt: now,
        revisionCount: task.revisionCount + 1,
        reviewFeedback: notes,
        history: [
          ...task.history,
          {
            timestamp: now,
            fromRole: 'reviewer',
            toRole: 'developer',
            message: `Reviewer meminta revisi: "${notes || 'Perbaikan diperlukan'}"`,
          },
        ],
      };

      return {
        nextTask,
        handover: {
          fromRole: 'reviewer',
          toRole: 'developer',
          reason: 'Revisi berkas diminta oleh Auditor',
        },
        isComplete: false,
        isRevision: true,
      };
    }
  }

  // Normal pipeline advance
  const nextIndex = currentIndex + 1;

  if (nextIndex >= updatedSteps.length) {
    // Finished all steps -> completed
    const finalReport = compileFinalDeliverable(task.title, updatedSteps);
    const completedTask: CompanyTask = {
      ...task,
      status: 'selesai',
      currentAssignee: 'ceo',
      currentStepIndex: nextIndex - 1,
      steps: updatedSteps,
      updatedAt: now,
      finalDeliverable: finalReport,
      history: [
        ...task.history,
        {
          timestamp: now,
          fromRole: currentStep.role,
          toRole: 'ceo',
          message: 'Tugas selesai dan berkas laporan akhir diserahkan ke CEO.',
        },
      ],
    };

    return {
      nextTask: completedTask,
      handover: {
        fromRole: currentStep.role,
        toRole: 'ceo',
        reason: 'Penyerahan hasil akhir ke CEO',
      },
      isComplete: true,
      isRevision: false,
    };
  }

  // Advance to next employee
  const nextStep = updatedSteps[nextIndex];
  nextStep.status = 'in_progress';
  nextStep.startedAt = now;

  const nextTask: CompanyTask = {
    ...task,
    currentAssignee: nextStep.role,
    currentStepIndex: nextIndex,
    steps: updatedSteps,
    updatedAt: now,
    status: nextStep.role === 'reviewer' ? 'menunggu_pemeriksaan' : 'dikerjakan',
    history: [
      ...task.history,
      {
        timestamp: now,
        fromRole: currentStep.role,
        toRole: nextStep.role,
        message: `${ROLE_STEP_TITLES[currentStep.role]} selesai. Berkas diserahkan ke ${nextStep.role.toUpperCase()}.`,
      },
    ],
  };

  return {
    nextTask,
    handover: {
      fromRole: currentStep.role,
      toRole: nextStep.role,
      reason: `Serah terima berkas untuk ${ROLE_STEP_TITLES[nextStep.role]}`,
    },
    isComplete: false,
    isRevision: false,
  };
}

export function abortTask(task: CompanyTask, reason: string = 'Dibatalkan oleh CEO'): CompanyTask {
  const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return {
    ...task,
    status: 'gagal',
    updatedAt: now,
    history: [
      ...task.history,
      {
        timestamp: now,
        fromRole: 'ceo',
        toRole: task.currentAssignee,
        message: `Tugas dihentikan oleh CEO: ${reason}`,
      },
    ],
  };
}

export function compileFinalDeliverable(title: string, steps: WorkflowStep[]): string {
  let doc = `# LAPORAN RESMI PROYEK: ${title}\n`;
  doc += `Perusahaan: INTI Virtual AI Corp\n`;
  doc += `Status: TERVERIFIKASI & SELESAI\n\n`;
  doc += `=========================================\n\n`;

  for (const step of steps) {
    doc += `### [${step.role.toUpperCase()}] ${step.title}\n`;
    if (step.completedAt) {
      doc += `*Selesai pada: ${step.completedAt}*\n\n`;
    }
    if (step.notes) {
      doc += `**Catatan:** ${step.notes}\n\n`;
    }
    if (step.output) {
      doc += `${step.output}\n\n`;
    }
    doc += `---\n\n`;
  }

  return doc;
}
