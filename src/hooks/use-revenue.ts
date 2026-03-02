import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  RevenueStatisticsResponse,
  RevenueByUserResponse,
} from "@/types/revenue";

// Get revenue statistics by period
export function useRevenueStatistics(
  period: "daily" | "weekly" | "monthly" | "yearly",
  params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }
) {
  return useQuery({
    queryKey: ["admin", "revenue", "statistics", period, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("period", period);
      if (params?.startDate) searchParams.set("startDate", params.startDate);
      if (params?.endDate) searchParams.set("endDate", params.endDate);
      if (params?.userId) searchParams.set("userId", params.userId);

      const response = await apiClient.get<RevenueStatisticsResponse>(
        `/admin/revenue/statistics?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

// Get revenue statistics grouped by user/CTV
export function useRevenueByUser(params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["admin", "revenue", "by-user", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.set("startDate", params.startDate);
      if (params?.endDate) searchParams.set("endDate", params.endDate);
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());

      const response = await apiClient.get<RevenueByUserResponse>(
        `/admin/revenue/by-user?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}
