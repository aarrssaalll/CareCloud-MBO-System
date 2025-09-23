// Types for the MBO workflow system

// Enhanced enums for better workflow management
export enum ObjectiveStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE', 
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE'
}

export enum WorkflowStatusEnum {
  DRAFT = 'DRAFT',                           // Initial creation
  ACTIVE = 'ACTIVE',                         // Employee is working on it
  COMPLETED = 'COMPLETED',                   // Employee marked as complete
  PENDING_MANAGER_REVIEW = 'PENDING_MANAGER_REVIEW', // Submitted to manager
  MANAGER_REVIEWED = 'MANAGER_REVIEWED',     // Manager has reviewed and scored
  PENDING_HR_REVIEW = 'PENDING_HR_REVIEW',  // Submitted to HR
  HR_APPROVED = 'HR_APPROVED',               // HR has processed for bonus
  REJECTED = 'REJECTED',                     // Rejected by manager/HR
  REVISION_REQUIRED = 'REVISION_REQUIRED'    // Needs employee revision
}

export enum ReviewType {
  MANAGER = 'MANAGER',
  HR = 'HR', 
  FINAL = 'FINAL',
  PEER = 'PEER'
}

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  HR = 'HR',
  SENIOR_MANAGEMENT = 'SENIOR_MANAGEMENT'
}

// Workflow transition rules
export const WorkflowTransitions: Record<WorkflowStatusEnum, WorkflowStatusEnum[]> = {
  [WorkflowStatusEnum.DRAFT]: [WorkflowStatusEnum.ACTIVE],
  [WorkflowStatusEnum.ACTIVE]: [WorkflowStatusEnum.COMPLETED, WorkflowStatusEnum.DRAFT],
  [WorkflowStatusEnum.COMPLETED]: [WorkflowStatusEnum.PENDING_MANAGER_REVIEW, WorkflowStatusEnum.ACTIVE],
  [WorkflowStatusEnum.PENDING_MANAGER_REVIEW]: [WorkflowStatusEnum.MANAGER_REVIEWED, WorkflowStatusEnum.REVISION_REQUIRED, WorkflowStatusEnum.REJECTED],
  [WorkflowStatusEnum.MANAGER_REVIEWED]: [WorkflowStatusEnum.PENDING_HR_REVIEW],
  [WorkflowStatusEnum.PENDING_HR_REVIEW]: [WorkflowStatusEnum.HR_APPROVED, WorkflowStatusEnum.REVISION_REQUIRED, WorkflowStatusEnum.REJECTED],
  [WorkflowStatusEnum.HR_APPROVED]: [], // Final state
  [WorkflowStatusEnum.REJECTED]: [WorkflowStatusEnum.DRAFT], // Can restart
  [WorkflowStatusEnum.REVISION_REQUIRED]: [WorkflowStatusEnum.ACTIVE, WorkflowStatusEnum.COMPLETED]
};

// Role permissions for workflow actions
export const WorkflowPermissions = {
  [UserRole.EMPLOYEE]: {
    canCreate: true,
    canEdit: [WorkflowStatusEnum.DRAFT, WorkflowStatusEnum.ACTIVE, WorkflowStatusEnum.REVISION_REQUIRED],
    canSubmit: [WorkflowStatusEnum.COMPLETED],
    canView: 'own' // Only their own objectives
  },
  [UserRole.MANAGER]: {
    canCreate: true,
    canEdit: [WorkflowStatusEnum.DRAFT, WorkflowStatusEnum.ACTIVE], 
    canReview: [WorkflowStatusEnum.PENDING_MANAGER_REVIEW],
    canAssign: true,
    canView: 'team' // Their team's objectives
  },
  [UserRole.HR]: {
    canCreate: true,
    canEdit: [WorkflowStatusEnum.DRAFT],
    canReview: [WorkflowStatusEnum.PENDING_HR_REVIEW],
    canApprove: [WorkflowStatusEnum.MANAGER_REVIEWED],
    canView: 'all' // All objectives in organization
  },
  [UserRole.SENIOR_MANAGEMENT]: {
    canView: 'all',
    canOverride: true // Can override any decision
  }
};

export interface ObjectiveSignature {
  id: string;
  employeeId: string;
  quarterYear: string; // e.g., "Q4-2024"
  signatureDate: Date;
  status: 'draft' | 'signed' | 'under_review' | 'approved' | 'rejected';
  digitalSignature: string; // Employee's digital signature
  ipAddress?: string;
  userAgent?: string;
}

export interface AIAnalysisResult {
  id: string;
  signatureId: string;
  employeeId: string;
  quarterYear: string;
  analysisDate: Date;
  totalScore: number;
  breakdown: {
    objectiveId: string;
    score: number;
    feedback: string;
    recommendations: string[];
  }[];
  overallFeedback: string;
  status: 'pending' | 'completed' | 'failed';
  aiProvider: 'gemini' | 'openai' | 'mock';
}

export interface ManagerReview {
  id: string;
  signatureId: string;
  aiAnalysisId: string;
  managerId: string;
  reviewDate: Date;
  decision: 'approved' | 'rejected' | 'needs_revision';
  overrides: {
    objectiveId: string;
    originalScore: number;
    newScore: number;
    justification: string;
  }[];
  comments: string;
  finalScore: number;
  status: 'pending' | 'completed';
}

export interface WorkflowStatus {
  employeeId: string;
  quarterYear: string;
  currentStage: 'draft' | 'employee_signature' | 'ai_analysis' | 'manager_review' | 'hr_approval' | 'completed';
  stages: {
    employee_signature: {
      completed: boolean;
      date?: Date;
      signatureId?: string;
    };
    ai_analysis: {
      completed: boolean;
      date?: Date;
      analysisId?: string;
      score?: number;
    };
    manager_review: {
      completed: boolean;
      date?: Date;
      reviewId?: string;
      finalScore?: number;
    };
    hr_approval: {
      completed: boolean;
      date?: Date;
      approvedBy?: string;
    };
  };
}

export interface ObjectiveWithWorkflow {
  id: string;
  title: string;
  description: string;
  weight: number;
  type: "quantitative" | "qualitative";
  target: string;
  progress: number;
  status: "pending" | "in_progress" | "completed" | "overdue";
  dueDate: string;
  remarks: string;
  lastUpdated: string;
  
  // Workflow related fields
  isLocked: boolean; // True after signature
  aiScore?: number;
  managerOverride?: {
    score: number;
    justification: string;
    timestamp: string;
    managerId: string;
  };
}
