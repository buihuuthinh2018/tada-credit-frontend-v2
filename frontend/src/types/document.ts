export interface DocumentRequirement {
  id: number;
  name: string;
  description: string | null;
  isRequired: boolean;
  maxFiles: number;
  allowedFormats: string[];
  maxSizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContractDocument {
  id: number;
  contractId: number;
  documentRequirementId: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy: number | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;

  documentRequirement?: DocumentRequirement;
  files?: DocumentFile[];
}

export interface DocumentFile {
  id: number;
  contractDocumentId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ReviewDocumentRequest {
  status: "APPROVED" | "REJECTED";
  note?: string;
}

export interface CreateDocumentRequirementRequest {
  name: string;
  description?: string;
  isRequired: boolean;
  maxFiles: number;
  allowedFormats: string[];
  maxSizeBytes: number;
}

export interface UpdateDocumentRequirementRequest {
  name?: string;
  description?: string;
  isRequired?: boolean;
  maxFiles?: number;
  allowedFormats?: string[];
  maxSizeBytes?: number;
}
