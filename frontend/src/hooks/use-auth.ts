import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types";

export function useLogin() {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient.post<AuthResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      login(data);
      toast.success("Đăng nhập thành công!");
      
      // Redirect based on role
      const hasAdminRole = data.user.roles?.some(r => 
        ["SUPER_ADMIN", "ADMIN"].includes(r.name)
      );
      
      if (hasAdminRole) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      login(data);
      toast.success("Đăng ký thành công!");
      router.push("/dashboard");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout, refreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success("Đăng xuất thành công");
      router.push("/login");
    },
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  const { user } = useAuthStore();
  return user;
}

export function useAuth() {
  const { isAuthenticated, user, hasPermission, hasRole, hasAnyRole } =
    useAuthStore();

  return {
    isAuthenticated,
    user,
    hasPermission,
    hasRole,
    hasAnyRole,
  };
}
