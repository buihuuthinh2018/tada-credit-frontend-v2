import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  User,
  Role,
  Permission,
  PaginatedResponse,
  UserFilters,
  UpdateUserRequest,
} from "@/types";
import { toast } from "sonner";

// Get all users (admin)
export function useAdminUsers(params?: UserFilters) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/users", { params });
      return data;
    },
  });
}

// Get user by ID (admin)
export function useAdminUser(id: number) {
  return useQuery<User>({
    queryKey: ["admin", "users", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Update user (admin)
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateUserRequest;
    }) => {
      const response = await apiClient.put(`/admin/users/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", id] });
      toast.success("Cập nhật người dùng thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Cập nhật người dùng thất bại"
      );
    },
  });
}

// Assign role to user
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: number; roleId: number }) => {
      const response = await apiClient.post(
        `/admin/users/${userId}/roles/${roleId}`
      );
      return response.data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
      toast.success("Gán quyền thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Gán quyền thất bại");
    },
  });
}

// Remove role from user
export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: number; roleId: number }) => {
      const response = await apiClient.patch(
        `/admin/users/${userId}/roles/${roleId}/remove`
      );
      return response.data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
      toast.success("Xóa quyền thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Xóa quyền thất bại");
    },
  });
}

// Verify user
export function useVerifyUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.patch(`/admin/users/${userId}/verify`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Xác minh người dùng thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Xác minh người dùng thất bại"
      );
    },
  });
}

// Suspend user
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.patch(`/admin/users/${userId}/suspend`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Đình chỉ người dùng thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Đình chỉ người dùng thất bại"
      );
    },
  });
}

// Activate user
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.patch(`/admin/users/${userId}/activate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Kích hoạt người dùng thành công!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Kích hoạt người dùng thất bại"
      );
    },
  });
}

// Get all roles
export function useRoles() {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/roles");
      return data;
    },
  });
}

// Get all permissions
export function usePermissions() {
  return useQuery<Permission[]>({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/permissions");
      return data;
    },
  });
}
