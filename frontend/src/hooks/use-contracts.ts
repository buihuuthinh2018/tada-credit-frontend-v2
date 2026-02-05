import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  Contract,
  PaginatedResponse,
  UpdateContractAnswersRequest,
  WorkflowTransition,
  ContractHistory,
  ContractTransitionRequest,
} from "@/types";
import { toast } from "sonner";

// Create contract request type
interface CreateContractRequest {
  serviceId: string;
  requestedAmount: number;  // Required: user's requested loan amount
  targetUserId?: string;  // For CTV creating on behalf of another user
}

// Create contract
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateContractRequest) => {
      const { data } = await apiClient.post("/contracts", request);
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
  type?: 'owned' | 'created';  // owned = user's own, created = CTV created for others
  serviceId?: string;
  stageCode?: string;
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
export function useContract(id: String) {
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
      id: String;
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
      contractId: String;
      docReqId: String;
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
export function useContractTransitions(contractId: string) {
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
export function useContractHistory(contractId: String) {
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
  userId?: string;
  serviceId?: string;
  stageId?: string;
  search?: string;
}) {
  return useQuery<PaginatedResponse<Contract>>({
    queryKey: ["admin", "contracts", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/contracts", { params });
      return data;
    },
  });
}

// Admin: Get contract detail by ID
export function useAdminContractDetail(id: string | undefined) {
  return useQuery<Contract>({
    queryKey: ["admin", "contracts", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/contracts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Admin: Get available transitions for a contract
export function useAdminContractTransitions(contractId: string | undefined) {
  return useQuery<WorkflowTransition[]>({
    queryKey: ["admin", "contracts", contractId, "transitions"],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/admin/contracts/${contractId}/transitions`
      );
      return data;
    },
    enabled: !!contractId,
  });
}

// Admin: Transition contract
export function useAdminTransitionContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      toStageId,
      note,
      disbursementAmount,
      revenuePercentage,
    }: {
      id: string;
      toStageId: string;
      note?: string;
      disbursementAmount?: number;
      revenuePercentage?: number;
    }) => {
      const response = await apiClient.patch(
        `/admin/contracts/${id}/transition`,
        { toStageId, note, disbursementAmount, revenuePercentage }
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contracts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "contracts", id] });
      toast.success("Chuyển trạng thái thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Chuyển trạng thái thất bại"
      );
    },
  });
}

// Admin: Update disbursed amount for a contract
export function useUpdateDisbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      disbursedAmount,
    }: {
      id: string;
      disbursedAmount: number;
    }) => {
      const response = await apiClient.patch(
        `/admin/contracts/${id}/disbursement`,
        { disbursedAmount }
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contracts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "contracts", id] });
      toast.success("Cập nhật số tiền giải ngân thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Cập nhật giải ngân thất bại"
      );
    },
  });
}

// Submit contract with answers and files (deferred upload)
export function useSubmitContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contractId,
      answers,
      files,
    }: {
      contractId: string;
      answers: Array<{ questionId: string; answer: string }>;
      files: Record<string, File[]>;
    }) => {
      const formData = new FormData();
      
      // Add answers as JSON
      formData.append("answers", JSON.stringify(answers));
      
      // Add files with document requirement IDs
      Object.entries(files).forEach(([docReqId, fileList]) => {
        fileList.forEach((file) => {
          formData.append(`files_${docReqId}`, file);
        });
      });

      const { data } = await apiClient.post(
        `/contracts/${contractId}/submit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      toast.success("Nộp hồ sơ thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Nộp hồ sơ thất bại");
    },
  });
}
