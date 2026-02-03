import { User } from "./auth";

export interface Workflow {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stages?: WorkflowStage[];
  transitions?: WorkflowTransition[];
}

export interface WorkflowStage {
  id: number;
  workflowId: number;
  name: string;
  description: string | null;
  order: number;
  isInitial: boolean;
  isFinal: boolean;
  requiredPermissions: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTransition {
  id: number;
  workflowId: number;
  name: string;
  fromStageId: number;
  toStageId: number;
  requiredPermissions: string[] | null;
  createdAt: string;
  updatedAt: string;

  fromStage?: WorkflowStage;
  toStage?: WorkflowStage;
}

export interface ContractHistory {
  id: number;
  contractId: number;
  fromStageId: number | null;
  toStageId: number;
  transitionId: number | null;
  changedBy: number;
  note: string | null;
  createdAt: string;

  fromStage?: WorkflowStage;
  toStage?: WorkflowStage;
  transition?: WorkflowTransition;
  changedByUser?: User;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateStageRequest {
  name: string;
  description?: string;
  order: number;
  isInitial?: boolean;
  isFinal?: boolean;
  requiredPermissions?: string[];
}

export interface CreateTransitionRequest {
  name: string;
  fromStageId: number;
  toStageId: number;
  requiredPermissions?: string[];
}
