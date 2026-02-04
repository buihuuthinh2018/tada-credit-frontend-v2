import { User } from "./auth";
import { PaginationParams } from "./api";

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;

  user?: User;
}

export interface AuditLogFilters extends PaginationParams {
  userId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
}
