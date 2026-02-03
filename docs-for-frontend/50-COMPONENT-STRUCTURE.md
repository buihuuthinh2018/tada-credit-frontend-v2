# 50 - Component Structure & Shadcn Setup

## 🎯 Overview

Hướng dẫn setup Shadcn/ui và cấu trúc components cho NextJS.

---

## 1. Install Shadcn/ui

```bash
npx shadcn-ui@latest init
```

### Configuration Options:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

---

## 2. Install Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add skeleton
```

---

## 3. Folder Structure

```
components/
├── ui/                    # Shadcn components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── layouts/
│   ├── dashboard-layout.tsx
│   ├── admin-layout.tsx
│   └── sidebar.tsx
├── auth/
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── protected-route.tsx
├── wallet/
│   ├── balance-card.tsx
│   ├── transaction-history.tsx
│   └── withdrawal-form.tsx
├── contracts/
│   ├── contract-list.tsx
│   ├── contract-card.tsx
│   └── contract-form.tsx
└── admin/
    ├── user-table.tsx
    ├── contract-review.tsx
    └── withdrawal-management.tsx
```

---

## 4. Layout Components

### Dashboard Layout

```typescript
// components/layouts/dashboard-layout.tsx
'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

### Sidebar

```typescript
// components/layouts/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Wallet, 
  FileText, 
  Settings,
  LogOut 
} from 'lucide-react';
import { useLogout } from '@/hooks/use-auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/wallet', label: 'Ví của tôi', icon: Wallet },
  { href: '/dashboard/contracts', label: 'Hợp đồng', icon: FileText },
  { href: '/dashboard/settings', label: 'Cài đặt', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const logoutMutation = useLogout();

  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">TADA Credit</h1>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                pathname === item.href
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => logoutMutation.mutate()}
        className="mt-auto flex items-center gap-3 px-3 py-2 w-full text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Đăng xuất
      </button>
    </aside>
  );
}
```

---

## 5. Reusable Components

### Data Table

```typescript
// components/ui/data-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
  }[];
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: number | string }>({ 
  data, 
  columns, 
  onRowClick 
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={String(column.key)}>{column.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow 
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
          >
            {columns.map((column) => (
              <TableCell key={String(column.key)}>
                {column.render 
                  ? column.render(row[column.key], row)
                  : String(row[column.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Pagination

```typescript
// components/ui/pagination.tsx
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Trước
      </Button>

      <span className="text-sm text-gray-600">
        Trang {page} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Sau
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
```

---

## 6. Form Components with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Đăng nhập</Button>
      </form>
    </Form>
  );
}
```

---

## ✅ Component Checklist

- ✅ Shadcn/ui components installed
- ✅ Dashboard layout với sidebar
- ✅ Data table component
- ✅ Pagination component
- ✅ Form validation với Zod
- ✅ Protected route wrapper
- ✅ Responsive design

---

## 🔗 Next Steps

1. ✅ Build specific feature components
2. ✅ Add loading states & skeletons
3. ✅ Implement error boundaries
