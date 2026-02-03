import { User } from "./auth";
import { Service } from "./service";
import { Workflow, WorkflowStage, WorkflowTransition } from "./workflow";
import { DocumentRequirement, ContractDocument } from "./document";
import { Question } from "./question";

export enum ContractStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
}

export interface Contract {
  id: number;
  userId: number;
  serviceId: number;
  workflowId: number;
  currentStageId: number;
  referrerId: number | null;
  status: ContractStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;

  user?: User;
  service?: Service;
  workflow?: Workflow;
  currentStage?: WorkflowStage;
  referrer?: User;
  documents?: ContractDocument[];
  answers?: ContractAnswer[];
}

export interface CreateContractRequest {
  serviceId: number;
}

export interface ContractAnswer {
  id: number;
  contractId: number;
  questionId: number;
  answer: string;
  createdAt: string;
  updatedAt: string;
  question?: Question;
}

export interface UpdateContractAnswersRequest {
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}

export interface ContractTransitionRequest {
  transitionId: number;
  note?: string;
}
