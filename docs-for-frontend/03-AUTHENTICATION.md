# 03 - Authentication & Authorization Setup

## 🎯 Overview

Hướng dẫn chi tiết cách setup Authentication & Authorization cho NextJS frontend sử dụng:
- **JWT** tokens (access + refresh)
- **Zustand** for auth state
- **Axios** for HTTP requests with interceptors
- **React Query** for server state

---

## 1. Setup Axios Client

### `lib/api-client.ts`

```typescript
import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle 401 & refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = data;
        useAuthStore.getState().setAccessToken(accessToken);

        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 2. Setup Zustand Auth Store

### `store/auth-store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: ({ user, accessToken, refreshToken }) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setAccessToken: (token: string) => {
        set({ accessToken: token });
      },

      setUser: (user: User) => {
        set({ user });
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        return user?.permissions?.includes(permission) || false;
      },

      hasRole: (role: string) => {
        const { user } = get();
        return user?.roles?.includes(role) || false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

## 3. Auth Hooks

### `hooks/use-auth.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  firstName: string;
  lastName: string;
  phone: string;
  referralCode?: string;
}

export function useLogin() {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiClient.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      login(data);
      toast.success('Đăng nhập thành công!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      login(data);
      toast.success('Đăng ký thành công!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
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
        await apiClient.post('/auth/logout', { refreshToken });
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached data
      toast.success('Đăng xuất thành công');
      router.push('/login');
    },
  });
}

export function useCurrentUser() {
  const { user } = useAuthStore();
  return user;
}

export function useAuth() {
  const { isAuthenticated, user, hasPermission, hasRole } = useAuthStore();

  return {
    isAuthenticated,
    user,
    hasPermission,
    hasRole,
  };
}
```

---

## 4. Protected Route Component

### `components/auth/protected-route.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, hasPermission, hasRole } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push('/unauthorized');
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, requiredPermission, requiredRole, router, hasPermission, hasRole]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 5. Login Page Example

### `app/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useLogin } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6">Đăng nhập</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
```

---

## 6. Dashboard Layout with Protection

### `app/dashboard/layout.tsx`

```typescript
'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logoutMutation = useLogout();

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white p-4">
          <h1 className="text-xl font-bold mb-8">TADA Credit</h1>
          
          {/* Navigation */}
          <nav className="space-y-2">
            <a href="/dashboard" className="block p-2 rounded hover:bg-gray-800">
              Dashboard
            </a>
            <a href="/dashboard/wallet" className="block p-2 rounded hover:bg-gray-800">
              Ví của tôi
            </a>
            <a href="/dashboard/contracts" className="block p-2 rounded hover:bg-gray-800">
              Hợp đồng
            </a>
          </nav>

          <div className="mt-auto pt-8">
            <Button
              onClick={() => logoutMutation.mutate()}
              variant="outline"
              className="w-full"
            >
              Đăng xuất
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

---

## 7. Admin Route Protection

### `app/admin/layout.tsx`

```typescript
'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="admin-layout">
        {children}
      </div>
    </ProtectedRoute>
  );
}
```

---

## 8. Permission-based UI Rendering

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export function UserManagement() {
  const { hasPermission } = useAuth();

  return (
    <div>
      <h2>Quản lý người dùng</h2>
      
      {hasPermission('users:create') && (
        <Button>Tạo người dùng mới</Button>
      )}
      
      {hasPermission('users:delete') && (
        <Button variant="destructive">Xóa người dùng</Button>
      )}
    </div>
  );
}
```

---

## ✅ Key Points

1. **Access Token** - Gửi trong header, ngắn hạn (15 mins)
2. **Refresh Token** - Lưu localStorage, dài hạn (7 days)
3. **Auto Refresh** - Axios interceptor tự động refresh khi 401
4. **Zustand Persist** - Auto save/restore auth state
5. **Protected Routes** - Component wrapper kiểm tra auth
6. **Permission Check** - `hasPermission()` & `hasRole()`

---

## 🔗 Next Steps

1. ✅ Copy all TypeScript types từ [05-TYPESCRIPT-TYPES.md](./05-TYPESCRIPT-TYPES.md)
2. ✅ Setup React Query từ [30-REACT-QUERY-SETUP.md](./30-REACT-QUERY-SETUP.md)
3. ✅ Build Wallet module từ [13-WALLET-MODULE.md](./13-WALLET-MODULE.md)
