import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Service, CreateServiceRequest, UpdateServiceRequest } from "@/types";
import { toast } from "sonner";

// Get all services (public)
export function useServices(params?: { activeOnly?: boolean }) {
  return useQuery<Service[]>({
    queryKey: ["services", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/services", { 
        params: params?.activeOnly ? { active: true } : undefined 
      });
      return data;
    },
  });
}

// Get service by ID
export function useService(id: string) {
  return useQuery<Service>({
    queryKey: ["services", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/services/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Admin: Create service
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateServiceRequest) => {
      const response = await apiClient.post("/admin/services", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Tạo dịch vụ thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Tạo dịch vụ thất bại");
    },
  });
}

// Admin: Update service
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateServiceRequest }) => {
      const response = await apiClient.put(`/admin/services/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", id] });
      toast.success("Cập nhật dịch vụ thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Cập nhật dịch vụ thất bại");
    },
  });
}

// Admin: Add document requirement to service
export function useAddDocumentToService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      documentId,
      isRequired,
    }: {
      serviceId: string;
      documentId: string;
      isRequired?: boolean;
    }) => {
      const response = await apiClient.post(
        `/admin/services/${serviceId}/documents/${documentId}?required=${isRequired ?? true}`
      );
      return response.data;
    },
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", serviceId] });
      toast.success("Thêm tài liệu thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Thêm tài liệu thất bại");
    },
  });
}

// Admin: Remove document requirement from service
export function useRemoveDocumentFromService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      documentId,
    }: {
      serviceId: string;
      documentId: string;
    }) => {
      const response = await apiClient.delete(
        `/admin/services/${serviceId}/documents/${documentId}`
      );
      return response.data;
    },
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", serviceId] });
      toast.success("Xóa tài liệu thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Xóa tài liệu thất bại");
    },
  });
}

// Admin: Add question to service
export function useAddQuestionToService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      questionId,
      isRequired,
      sortOrder,
    }: {
      serviceId: string;
      questionId: string;
      isRequired?: boolean;
      sortOrder?: number;
    }) => {
      const response = await apiClient.post(
        `/admin/services/${serviceId}/questions/${questionId}?required=${isRequired ?? true}&sortOrder=${sortOrder ?? 0}`
      );
      return response.data;
    },
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", serviceId] });
      toast.success("Thêm câu hỏi thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Thêm câu hỏi thất bại");
    },
  });
}

// Admin: Remove question from service
export function useRemoveQuestionFromService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      questionId,
    }: {
      serviceId: string;
      questionId: string;
    }) => {
      const response = await apiClient.delete(
        `/admin/services/${serviceId}/questions/${questionId}`
      );
      return response.data;
    },
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", serviceId] });
      toast.success("Xóa câu hỏi thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Xóa câu hỏi thất bại");
    },
  });
}
