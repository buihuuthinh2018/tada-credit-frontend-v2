import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  DocumentRequirement,
  CreateDocumentRequirementRequest,
  UpdateDocumentRequirementRequest,
  ReviewDocumentRequest,
} from "@/types";
import { toast } from "sonner";

// Get all document requirements
export function useDocumentRequirements() {
  return useQuery<DocumentRequirement[]>({
    queryKey: ["document-requirements"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/document-requirements", {
        params: { page: 1, limit: 1000, activeOnly: false },
      });

      // Backend returns paginated shape: { data: [...], meta: {...} }
      // Keep backward-compat in case older deployments returned a raw array.
      if (Array.isArray(data)) return data;
      return data?.data ?? [];
    },
  });
}

// Get document requirement by ID
export function useDocumentRequirement(id: string) {
  return useQuery<DocumentRequirement>({
    queryKey: ["document-requirements", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/document-requirements/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Create document requirement
export function useCreateDocumentRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDocumentRequirementRequest) => {
      const response = await apiClient.post("/admin/document-requirements", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-requirements"] });
      toast.success("Tạo yêu cầu tài liệu thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Tạo yêu cầu tài liệu thất bại"
      );
    },
  });
}

// Update document requirement
export function useUpdateDocumentRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDocumentRequirementRequest;
    }) => {
      const response = await apiClient.put(
        `/admin/document-requirements/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["document-requirements"] });
      queryClient.invalidateQueries({ queryKey: ["document-requirements", id] });
      toast.success("Cập nhật yêu cầu tài liệu thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Cập nhật yêu cầu tài liệu thất bại"
      );
    },
  });
}

// Review document
export function useReviewDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contractId,
      documentId,
      data,
    }: {
      contractId: number;
      documentId: number;
      data: ReviewDocumentRequest;
    }) => {
      const response = await apiClient.patch(
        `/admin/contracts/${contractId}/documents/${documentId}/review`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      toast.success("Đánh giá tài liệu thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Đánh giá tài liệu thất bại");
    },
  });
}
