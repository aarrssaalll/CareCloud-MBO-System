// Types for the MBO workflow system

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
