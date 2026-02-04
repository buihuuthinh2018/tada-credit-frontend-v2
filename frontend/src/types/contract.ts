import { User } from "./auth";
import { Service } from "./service";
import { Workflow, WorkflowStage, WorkflowTransition } from "./workflow";
import { DocumentRequirement, ContractDocument } from "./document";
import { Question } from "./question";

// Stage codes are dynamic - created by admin via workflow configuration
// The color for each stage is stored in the stage.color field

export interface Contract {
  id: string;
  contract_number: string; // Auto-generated readable ID (e.g., HD-2026-000001)
  user_id: string;
  service_id: string;
  current_stage_id: string;
  referrer_id?: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;

  user?: User;
  service?: Service;
  workflow?: Workflow;
  stage?: WorkflowStage;
  referrer?: User;
  documents?: ContractDocument[];
  answers?: ContractAnswer[];
  histories?: ContractHistory[];
}

export interface CreateContractRequest {
  serviceId: string;
}

export interface ContractAnswer {
  id: string;
  contract_id: string;
  question_id: string;
  answer: string;
  created_at: string;
  updated_at: string;
  question?: Question;
}

export interface UpdateContractAnswersRequest {
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
}

export interface ContractTransitionRequest {
  toStageId: string;
  note?: string;
}

export interface ContractHistory {
  id: string;
  contract_id: string;
  from_stage_id: string | null;
  to_stage_id: string;
  transition_id?: string | null;
  changed_by: string;
  note?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  
  fromStage?: WorkflowStage;
  toStage?: WorkflowStage;
  transition?: WorkflowTransition;
  changedByUser?: User;
}
