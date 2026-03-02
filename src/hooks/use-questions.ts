import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Question } from "@/types";
import { toast } from "sonner";

type QuestionsListResponse =
  | Question[]
  | {
      data: Question[];
      meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    };

// Get all questions (admin)
export function useQuestions(options?: {
  activeOnly?: boolean;
  limit?: number;
  page?: number;
}) {
  const { activeOnly = true, limit = 1000, page = 1 } = options ?? {};

  return useQuery<Question[]>({
    queryKey: ["questions", { activeOnly, limit, page }],
    queryFn: async () => {
      const { data } = await apiClient.get<QuestionsListResponse>("/admin/questions", {
        params: { activeOnly, limit, page },
      });

      if (Array.isArray(data)) return data;
      return data?.data ?? [];
    },
  });
}

// Create question (admin)
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { content: string; type: string; config?: any }) => {
      const response = await apiClient.post("/admin/questions", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Tạo câu hỏi thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Tạo câu hỏi thất bại");
    },
  });
}

// Update question (admin)
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { content?: string; type?: string; config?: any; isActive?: boolean };
    }) => {
      const response = await apiClient.put(`/admin/questions/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["questions", id] });
      toast.success("Cập nhật câu hỏi thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Cập nhật câu hỏi thất bại");
    },
  });
}

// Delete question (admin)
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/questions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Xóa câu hỏi thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Xóa câu hỏi thất bại");
    },
  });
}
