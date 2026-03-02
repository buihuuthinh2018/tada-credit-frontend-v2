import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  Workflow,
  WorkflowStage,
  WorkflowTransition,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  CreateStageRequest,
  UpdateStageRequest,
  CreateTransitionRequest,
  UpdateTransitionRequest,
} from "@/types";
import { toast } from "sonner";

// Get all workflows
export function useWorkflows() {
  return useQuery<Workflow[]>({
    queryKey: ["workflows"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/workflows");
      return data.data;
    },
  });
}

// Get workflow by ID
export function useWorkflow(id: string) {
  return useQuery<Workflow>({
    queryKey: ["workflows", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/workflows/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Create workflow
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkflowRequest) => {
      const response = await apiClient.post("/admin/workflows", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Tạo workflow thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Tạo workflow thất bại");
    },
  });
}

// Update workflow
export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateWorkflowRequest;
    }) => {
      const response = await apiClient.put(`/admin/workflows/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.invalidateQueries({ queryKey: ["workflows", id] });
      toast.success("Cập nhật workflow thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Cập nhật workflow thất bại");
    },
  });
}

// ==================== STAGE HOOKS ====================

// Create stage
export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workflowId,
      data,
    }: {
      workflowId: string;
      data: CreateStageRequest;
    }) => {
      const response = await apiClient.post(
        `/admin/workflows/${workflowId}/stages`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", workflowId] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Tạo stage thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Tạo stage thất bại");
    },
  });
}

// Update stage
export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workflowId,
      stageId,
      data,
    }: {
      workflowId: string;
      stageId: string;
      data: UpdateStageRequest;
    }) => {
      const response = await apiClient.put(
        `/admin/workflows/${workflowId}/stages/${stageId}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", workflowId] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Cập nhật stage thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Cập nhật stage thất bại");
    },
  });
}

// Delete stage
export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workflowId,
      stageId,
    }: {
      workflowId: string;
      stageId: string;
    }) => {
      const response = await apiClient.delete(
        `/admin/workflows/${workflowId}/stages/${stageId}`
      );
      return response.data;
    },
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", workflowId] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Xóa stage thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Xóa stage thất bại");
    },
  });
}

// ==================== TRANSITION HOOKS ====================

// Create transition
export function useCreateTransition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workflowId,
      data,
    }: {
      workflowId: string;
      data: CreateTransitionRequest;
    }) => {
      const response = await apiClient.post(
        `/admin/workflows/${workflowId}/transitions`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", workflowId] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Tạo transition thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Tạo transition thất bại");
    },
  });
}

// Update transition
export function useUpdateTransition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workflowId,
      transitionId,
      data,
    }: {
      workflowId: string;
      transitionId: string;
      data: UpdateTransitionRequest;
    }) => {
      const response = await apiClient.put(
        `/admin/workflows/${workflowId}/transitions/${transitionId}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", workflowId] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Cập nhật transition thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Cập nhật transition thất bại");
    },
  });
}

// Delete transition
export function useDeleteTransition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workflowId,
      transitionId,
    }: {
      workflowId: string;
      transitionId: string;
    }) => {
      const response = await apiClient.delete(
        `/admin/workflows/${workflowId}/transitions/${transitionId}`
      );
      return response.data;
    },
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", workflowId] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Xóa transition thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Xóa transition thất bại");
    },
  });
}
