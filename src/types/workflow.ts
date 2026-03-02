import { User } from "./auth";

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  version?: number;
  stages?: WorkflowStage[];
  transitions?: WorkflowTransition[];
  // Aggregated counts from backend
  _count?: {
    stages?: number;
    transitions?: number;
    services?: number;
  };
}

export interface WorkflowStage {
  id: string;
  workflow_id: string;
  code?: string;
  name: string;
  description?: string | null;
  stage_order: number;
  color?: string; // Hex color code, e.g., #FF5733
  is_initial?: boolean;
  is_final?: boolean;
  is_required?: boolean; // Whether this is a required system stage (DRAFT, SUBMITTED, COMPLETED)
  triggers_commission?: boolean; // Whether transitioning to this stage triggers commission calculation
  required_permissions?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowTransition {
  id: string;
  workflow_id: string;
  name: string;
  from_stage_id: string;
  to_stage_id: string;
  required_permissions: string[] | null;
  created_at: string;
  updated_at?: string;

  from_stage?: WorkflowStage;
  to_stage?: WorkflowStage;
}

export interface CreateWorkflowStageRequest {
  code: string;
  name: string;
  stageOrder: number;
  color?: string;
  isRequired?: boolean;
  triggersCommission?: boolean;
}

export interface CreateWorkflowTransitionRequest {
  fromStageCode: string;
  toStageCode: string;
  requiredPermission?: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  stages?: CreateWorkflowStageRequest[];
  transitions?: CreateWorkflowTransitionRequest[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateStageRequest {
  code: string;
  name: string;
  stageOrder: number;
  color?: string;
}

export interface UpdateStageRequest {
  code?: string;
  name?: string;
  stageOrder?: number;
  color?: string;
}

export interface CreateTransitionRequest {
  fromStageId: string;
  toStageId: string;
  requiredPermission?: string;
}

export interface UpdateTransitionRequest {
  fromStageId?: string;
  toStageId?: string;
  requiredPermission?: string;
}
