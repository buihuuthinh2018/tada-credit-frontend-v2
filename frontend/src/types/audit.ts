import { User } from "./auth";
import { PaginationParams } from "./api";

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  resource: string;
  targetType: string | null;
  targetId: number | null;
  changes: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;

  user?: User;
}

export interface AuditLogFilters extends PaginationParams {
  userId?: number;
  action?: string;
  resource?: string;
  targetType?: string;
  targetId?: number;
}
