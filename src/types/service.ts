import { DocumentRequirement } from "./document";
import { Question } from "./question";
import { Workflow } from "./workflow";

export interface Service {
  id: string;
  name: string;
  description: string;
  workflow_id?: string;
  is_active: boolean;
  commission_enabled: boolean;
  min_loan_amount?: number;
  max_loan_amount?: number;
  created_at: string;
  updated_at?: string;
  // Nested workflow
  workflow?: Workflow;
  // Nested arrays from service relations
  questions?: Array<Question & { isRequired?: boolean; sortOrder?: number }>;
  documents?: ServiceDocument[];
  // Alternative format from API (flattened)
  documentRequirements?: (DocumentRequirement & { isRequired?: boolean })[];
}

// Service-Question join table
export interface ServiceQuestion {
  id: string;
  service_id: string;
  question_id: string;
  is_required: boolean;
  sort_order: number;
  question: Question;
}

// Service-Document join table
export interface ServiceDocument {
  id: string;
  service_id: string;
  document_requirement_id: string;
  is_required: boolean;
  document_requirement: DocumentRequirement;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  workflowId: string;
  minLoanAmount?: number;
  maxLoanAmount?: number;

  // Optional relations
  documentRequirementIds?: string[];
  documentRequirements?: Array<{ id: string; isRequired?: boolean }>;
  questionIds?: string[];
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  commission_enabled?: boolean;
  min_loan_amount?: number;
  max_loan_amount?: number;
}
