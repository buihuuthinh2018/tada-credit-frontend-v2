import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  Workflow,
  WorkflowStage,
  WorkflowTransition,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  CreateStageRequest,
  CreateTransitionRequest,
} from "@/types";
import { toast } from "sonner";

// Get all workflows
export function useWorkflows() {
  return useQuery<Workflow[]>({
    queryKey: ["workflows"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/workflows");
      return data;
    },
  });
}

// Get workflow by ID
export function useWorkflow(id: number) {
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
      id: number;
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

// Create stage
export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workflowId,
      data,
    }: {
      workflowId: number;
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
      toast.success("Tạo stage thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Tạo stage thất bại");
    },
  });
}

// Create transition
export function useCreateTransition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workflowId,
      data,
    }: {
      workflowId: number;
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
      toast.success("Tạo transition thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Tạo transition thất bại");
    },
  });
}
