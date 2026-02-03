import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Service, CreateServiceRequest, UpdateServiceRequest } from "@/types";
import { toast } from "sonner";

// Get all services (public)
export function useServices() {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await apiClient.get("/services");
      return data;
    },
  });
}

// Get service by ID
export function useService(id: number) {
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
    mutationFn: async ({ id, data }: { id: number; data: UpdateServiceRequest }) => {
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
