import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  Contract,
  PaginatedResponse,
  ContractStatus,
  UpdateContractAnswersRequest,
  WorkflowTransition,
  ContractHistory,
  ContractTransitionRequest,
} from "@/types";
import { toast } from "sonner";

// Create contract
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: number) => {
      const { data } = await apiClient.post("/contracts", { serviceId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Tạo hồ sơ thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Tạo hồ sơ thất bại");
    },
  });
}

// Get user's contracts
export function useContracts(params?: {
  page?: number;
  limit?: number;
  status?: ContractStatus;
}) {
  return useQuery<PaginatedResponse<Contract>>({
    queryKey: ["contracts", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/contracts", { params });
      return data;
    },
  });
}

// Get contract by ID
export function useContract(id: number) {
  return useQuery<Contract>({
    queryKey: ["contracts", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/contracts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Update contract answers
export function useUpdateContractAnswers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      answers,
    }: {
      id: number;
      answers: UpdateContractAnswersRequest["answers"];
    }) => {
      const { data } = await apiClient.put(`/contracts/${id}/answers`, {
        answers,
      });
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["contracts", id] });
      toast.success("Lưu câu trả lời thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Lưu câu trả lời thất bại");
    },
  });
}

// Upload contract document
export function useUploadContractDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contractId,
      docReqId,
      files,
    }: {
      contractId: number;
      docReqId: number;
      files: FileList;
    }) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const { data } = await apiClient.post(
        `/contracts/${contractId}/documents/${docReqId}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      toast.success("Upload tài liệu thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Upload tài liệu thất bại");
    },
  });
}

// Get available transitions for a contract
export function useContractTransitions(contractId: number) {
  return useQuery<WorkflowTransition[]>({
    queryKey: ["contracts", contractId, "transitions"],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/contracts/${contractId}/transitions`
      );
      return data;
    },
    enabled: !!contractId,
  });
}

// Get contract history
export function useContractHistory(contractId: number) {
  return useQuery<ContractHistory[]>({
    queryKey: ["contracts", contractId, "history"],
    queryFn: async () => {
      const { data } = await apiClient.get(`/contracts/${contractId}/history`);
      return data;
    },
    enabled: !!contractId,
  });
}

// Admin: Get all contracts
export function useAdminContracts(params?: {
  page?: number;
  limit?: number;
  userId?: number;
  serviceId?: number;
  status?: ContractStatus;
}) {
  return useQuery<PaginatedResponse<Contract>>({
    queryKey: ["admin", "contracts", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/contracts", { params });
      return data;
    },
  });
}

// Admin: Transition contract
export function useAdminTransitionContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: ContractTransitionRequest;
    }) => {
      const response = await apiClient.patch(
        `/admin/contracts/${id}/transition`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contracts", id] });
      toast.success("Chuyển trạng thái thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Chuyển trạng thái thất bại"
      );
    },
  });
}
