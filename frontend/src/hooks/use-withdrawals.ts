import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  Withdrawal,
  CreateWithdrawalRequest,
  PaginatedResponse,
  WithdrawalStatus,
  ProcessWithdrawalRequest,
} from "@/types";
import { toast } from "sonner";

// Create withdrawal request
export function useCreateWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWithdrawalRequest) => {
      const response = await apiClient.post("/withdrawals", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Tạo yêu cầu rút tiền thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Tạo yêu cầu thất bại");
    },
  });
}

// Get user's withdrawals
export function useWithdrawals(params?: {
  page?: number;
  limit?: number;
  status?: WithdrawalStatus;
}) {
  return useQuery<PaginatedResponse<Withdrawal>>({
    queryKey: ["withdrawals", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/withdrawals", { params });
      return data;
    },
  });
}

// Get withdrawal by ID
export function useWithdrawal(id: string) {
  return useQuery<Withdrawal>({
    queryKey: ["withdrawals", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/withdrawals/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Cancel withdrawal
export function useCancelWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/withdrawals/${id}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      toast.success("Hủy yêu cầu thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Hủy yêu cầu thất bại");
    },
  });
}

// Admin: Get all withdrawals
export function useAdminWithdrawals(params?: {
  page?: number;
  limit?: number;
  status?: WithdrawalStatus;
  userId?: number;
}) {
  return useQuery<PaginatedResponse<Withdrawal>>({
    queryKey: ["admin", "withdrawals", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/withdrawals", { params });
      return data;
    },
  });
}

// Admin: Process withdrawal
export function useProcessWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ProcessWithdrawalRequest;
    }) => {
      const response = await apiClient.patch(
        `/admin/withdrawals/${id}/process`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      toast.success("Xử lý yêu cầu thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Xử lý yêu cầu thất bại");
    },
  });
}
