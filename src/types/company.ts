export type EmployeeRole =
  | 'ceo'
  | 'pm'
  | 'researcher'
  | 'designer'
  | 'developer'
  | 'writer'
  | 'qa'
  | 'reviewer';

export type TaskStatus =
  | 'antre'
  | 'dikerjakan'
  | 'menunggu_pemeriksaan'
  | 'revisi'
  | 'selesai'
  | 'gagal';

export type TaskPriority = 'normal' | 'high' | 'urgent';

export interface WorkflowStep {
  role: EmployeeRole;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'revising';
  output?: string;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CompanyTask {
  id: string;
  title: string;
  prompt: string;
  priority: TaskPriority;
  status: TaskStatus;
  currentAssignee: EmployeeRole;
  currentStepIndex: number;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  finalDeliverable: string | null;
  reviewFeedback?: string;
  isAiPowered: boolean;
  revisionCount: number;
  history: Array<{
    timestamp: string;
    fromRole: EmployeeRole;
    toRole: EmployeeRole;
    message: string;
  }>;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'order' | 'handover' | 'start' | 'complete' | 'revision' | 'system';
  message: string;
  actor: string;
  role?: EmployeeRole;
  taskId?: string;
}

export interface EmployeeInfo {
  id: string;
  role: EmployeeRole;
  name: string;
  title: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  skinColor: string;
  specialty: string;
  deskX: number; // grid coords in office
  deskY: number;
  facing: 'left' | 'right' | 'down' | 'up';
}

export interface HandoverAnimationState {
  active: boolean;
  fromRole: EmployeeRole;
  toRole: EmployeeRole;
  progress: number; // 0 to 1
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  carrierX: number;
  carrierY: number;
  folderProgress: number; // 0 to 1 during hand-off burst
  phase: 'walking' | 'handing_over' | 'returning';
}
