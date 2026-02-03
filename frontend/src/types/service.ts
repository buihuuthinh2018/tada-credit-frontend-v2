import { DocumentRequirement } from "./document";
import { Question } from "./question";

export interface Service {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  documentRequirements?: DocumentRequirement[];
  questions?: Question[];
}

export interface CreateServiceRequest {
  name: string;
  description: string;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}
