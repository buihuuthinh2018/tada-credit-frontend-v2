# 30 - React Query Setup & Patterns

## 🎯 Overview

Hướng dẫn setup React Query (TanStack Query) cho NextJS frontend.

---

## 1. Installation

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

---

## 2. Setup Query Client Provider

### `lib/react-query.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
```

---

### `components/providers/react-query-provider.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

### `app/layout.tsx`

```typescript
import { ReactQueryProvider } from '@/components/providers/react-query-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

---

## 3. Query Patterns

### Basic Query

```typescript
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/users');
      return data;
    },
  });
}
```

### Query with Parameters

```typescript
export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/users/${id}`);
      return data;
    },
    enabled: !!id, // Only run when id exists
  });
}
```

### Paginated Query

```typescript
export function useUsers(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/users', { params });
      return data;
    },
    keepPreviousData: true, // Smooth pagination
  });
}
```

---

## 4. Mutation Patterns

### Basic Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const response = await apiClient.post('/admin/users', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Tạo user thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo user thất bại');
    },
  });
}
```

### Optimistic Update

```typescript
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserRequest }) => {
      const response = await apiClient.put(`/admin/users/${id}`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users', id] });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(['users', id]);

      // Optimistically update
      queryClient.setQueryData(['users', id], (old: any) => ({
        ...old,
        ...data,
      }));

      return { previousUser };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(['users', id], context?.previousUser);
      toast.error('Cập nhật thất bại');
    },
    onSuccess: () => {
      toast.success('Cập nhật thành công!');
    },
    onSettled: (data, error, { id }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['users', id] });
    },
  });
}
```

---

## 5. Infinite Query (Infinite Scroll)

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteContracts() {
  return useInfiniteQuery({
    queryKey: ['contracts', 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await apiClient.get('/contracts', {
        params: { page: pageParam, limit: 10 },
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.page * lastPage.limit < lastPage.total;
      return hasMore ? lastPage.page + 1 : undefined;
    },
  });
}

// Usage in component
function ContractList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteContracts();

  return (
    <div>
      {data?.pages.map((page) =>
        page.data.map((contract) => <div key={contract.id}>{contract.id}</div>)
      )}

      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );
}
```

---

## 6. Dependent Queries

```typescript
export function useContractWithDetails(id: number) {
  const { data: contract } = useQuery({
    queryKey: ['contracts', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/contracts/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const { data: service } = useQuery({
    queryKey: ['services', contract?.serviceId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/services/${contract.serviceId}`);
      return data;
    },
    enabled: !!contract?.serviceId, // Only fetch when contract is loaded
  });

  return { contract, service };
}
```

---

## 7. Prefetching

```typescript
import { useQueryClient } from '@tanstack/react-query';

export function ContractListItem({ contractId }: { contractId: number }) {
  const queryClient = useQueryClient();

  const prefetchContract = () => {
    queryClient.prefetchQuery({
      queryKey: ['contracts', contractId],
      queryFn: async () => {
        const { data } = await apiClient.get(`/contracts/${contractId}`);
        return data;
      },
    });
  };

  return (
    <div onMouseEnter={prefetchContract}>
      <Link href={`/contracts/${contractId}`}>Contract {contractId}</Link>
    </div>
  );
}
```

---

## 8. Query Invalidation Patterns

```typescript
const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['users', 1] });

// Invalidate all users queries
queryClient.invalidateQueries({ queryKey: ['users'] });

// Invalidate with predicate
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === 'users' && query.queryKey[1] !== 'me',
});
```

---

## 9. Error Handling

```typescript
import { useQuery } from '@tanstack/react-query';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/users');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Đã có lỗi xảy ra');
    },
  });
}

// In component
function UserList() {
  const { data, error, isError, isLoading } = useUsers();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

---

## ✅ Best Practices

1. **Query Keys**: Use arrays with specific identifiers
   - `['users']` - All users
   - `['users', id]` - Specific user
   - `['users', params]` - Filtered users

2. **Invalidation**: Invalidate related queries after mutations

3. **Optimistic Updates**: For better UX in update operations

4. **Error Handling**: Always handle errors with toast/alerts

5. **Stale Time**: Set appropriate stale times for different data

6. **Devtools**: Use React Query DevTools in development

---

## 🔗 Next Steps

1. ✅ Implement all hooks từ [02-API-ENDPOINTS.md](./02-API-ENDPOINTS.md)
2. ✅ Build Wallet module từ [13-WALLET-MODULE.md](./13-WALLET-MODULE.md)
3. ✅ Build Contract flow từ [42-CONTRACT-APPLICATION-FLOW.md](./42-CONTRACT-APPLICATION-FLOW.md)
