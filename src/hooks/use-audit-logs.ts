import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { AuditLog, AuditLogFilters, PaginatedResponse } from "@/types";

// Get audit logs
export function useAuditLogs(params?: AuditLogFilters) {
  return useQuery<PaginatedResponse<AuditLog>>({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/audit-logs", { params });
      return data;
    },
  });
}

// Get audit logs by user
export function useAuditLogsByUser(userId: string) {
  return useQuery<AuditLog[]>({
    queryKey: ["audit-logs", "by-user", userId],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/audit-logs/by-user", {
        params: { userId },
      });
      return data;
    },
    enabled: !!userId,
  });
}

// Get audit logs by target
export function useAuditLogsByTarget(targetType: string, targetId: string) {
  return useQuery<AuditLog[]>({
    queryKey: ["audit-logs", "by-target", targetType, targetId],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/audit-logs/by-target", {
        params: { targetType, targetId },
      });
      return data;
    },
    enabled: !!targetType && !!targetId,
  });
}

// Get audit logs by action
export function useAuditLogsByAction(action: string) {
  return useQuery<AuditLog[]>({
    queryKey: ["audit-logs", "by-action", action],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/audit-logs/by-action", {
        params: { action },
      });
      return data;
    },
    enabled: !!action,
  });
}
