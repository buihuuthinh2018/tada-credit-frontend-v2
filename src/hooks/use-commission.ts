import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { CommissionHistory, PaginatedResponse } from "@/types";

// Get commission history
export function useCommissionHistory(params?: {
  page?: number;
  limit?: number;
  status?: "PENDING" | "PAID";
}) {
  return useQuery<PaginatedResponse<CommissionHistory>>({
    queryKey: ["commission", "history", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/commission/history", { params });
      return data;
    },
  });
}
