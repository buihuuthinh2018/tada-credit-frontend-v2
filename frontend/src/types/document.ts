export interface DocumentRequirement {
  id: string;
  code: string;
  name: string;
  version: number;
  description?: string | null;
  config: {
    maxFiles: number;
    minFiles?: number;
    allowedTypes: string[];
    maxSizeBytes: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ContractDocument {
  id: string;
  contract_id: string;
  document_requirement_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;

  document_requirement?: DocumentRequirement;
  files?: DocumentFile[];
}

export interface DocumentFile {
  id: string;
  contractDocumentId: string;
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
  code: string;
  name: string;
  config: {
    maxFiles: number;
    minFiles?: number;
    allowedTypes: string[];
    maxSizeBytes: number;
    expirationDays?: number;
  };
}

export interface UpdateDocumentRequirementRequest {
  name?: string;
  config?: {
    maxFiles?: number;
    minFiles?: number;
    allowedTypes?: string[];
    maxSizeBytes?: number;
    expirationDays?: number;
  };
}
