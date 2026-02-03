# 13 - Wallet Module - Complete Guide

## 🎯 Overview

Hướng dẫn build module Wallet hoàn chỉnh với các features:
- Xem số dư ví
- Lịch sử giao dịch (ledger entries)
- Tạo yêu cầu rút tiền
- Admin: Quản lý withdrawals

---

## 1. Wallet Hooks

### `hooks/use-wallet.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Wallet, WalletBalance, LedgerEntry, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

// Get wallet info
export function useWallet() {
  return useQuery<Wallet>({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet');
      return data;
    },
  });
}

// Get wallet balance
export function useWalletBalance() {
  return useQuery<WalletBalance>({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/balance');
      return data;
    },
  });
}

// Get transactions (ledger entries)
export function useWalletTransactions(params?: {
  page?: number;
  limit?: number;
  entryType?: 'DEBIT' | 'CREDIT';
}) {
  return useQuery<PaginatedResponse<LedgerEntry>>({
    queryKey: ['wallet', 'transactions', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/transactions', { params });
      return data;
    },
  });
}
```

---

## 2. Withdrawal Hooks

### `hooks/use-withdrawals.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { 
  Withdrawal, 
  CreateWithdrawalRequest, 
  PaginatedResponse,
  WithdrawalStatus 
} from '@/types';
import { toast } from 'sonner';

// Create withdrawal request
export function useCreateWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWithdrawalRequest) => {
      const response = await apiClient.post('/withdrawals', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Tạo yêu cầu rút tiền thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo yêu cầu thất bại');
    },
  });
}

// Get user's withdrawals
export function useWithdrawals(params?: {
  page?: number;
  limit?: number;
  status?: WithdrawalStatus;
}) {
  return useQuery<PaginatedResponse<Withdrawal>>({
    queryKey: ['withdrawals', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/withdrawals', { params });
      return data;
    },
  });
}

// Get withdrawal by ID
export function useWithdrawal(id: number) {
  return useQuery<Withdrawal>({
    queryKey: ['withdrawals', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/withdrawals/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Cancel withdrawal
export function useCancelWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.patch(`/withdrawals/${id}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Hủy yêu cầu thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Hủy yêu cầu thất bại');
    },
  });
}
```

---

## 3. Wallet Balance Card Component

### `components/wallet/balance-card.tsx`

```typescript
'use client';

import { useWalletBalance } from '@/hooks/use-wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function WalletBalanceCard() {
  const { data, isLoading } = useWalletBalance();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Số dư ví</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  const balance = parseFloat(data?.balance || '0');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Số dư ví</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-green-600">
          {balance.toLocaleString('vi-VN')} VNĐ
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 4. Transaction History Component

### `components/wallet/transaction-history.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useWalletTransactions } from '@/hooks/use-wallet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function TransactionHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWalletTransactions({ page, limit: 10 });

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Lịch sử giao dịch</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ngày</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Số dư sau</TableHead>
            <TableHead>Mô tả</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
              </TableCell>
              <TableCell>
                <Badge variant={transaction.entryType === 'CREDIT' ? 'success' : 'destructive'}>
                  {transaction.entryType === 'CREDIT' ? 'Cộng tiền' : 'Trừ tiền'}
                </Badge>
              </TableCell>
              <TableCell className={transaction.entryType === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
                {transaction.entryType === 'CREDIT' ? '+' : '-'}
                {parseFloat(transaction.amount).toLocaleString('vi-VN')} VNĐ
              </TableCell>
              <TableCell>
                {parseFloat(transaction.balanceAfter).toLocaleString('vi-VN')} VNĐ
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between">
        <Button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Trang trước
        </Button>
        <span>Trang {page} / {Math.ceil((data?.total || 0) / 10)}</span>
        <Button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= Math.ceil((data?.total || 0) / 10)}
        >
          Trang sau
        </Button>
      </div>
    </div>
  );
}
```

---

## 5. Withdrawal Form Component

### `components/wallet/withdrawal-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useCreateWithdrawal } from '@/hooks/use-withdrawals';
import { useWalletBalance } from '@/hooks/use-wallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function WithdrawalForm() {
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  const { data: balanceData } = useWalletBalance();
  const createWithdrawal = useCreateWithdrawal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createWithdrawal.mutate({
      amount: parseFloat(amount),
      bankName,
      bankAccountNumber,
      bankAccountName,
    }, {
      onSuccess: () => {
        // Reset form
        setAmount('');
        setBankName('');
        setBankAccountNumber('');
        setBankAccountName('');
      },
    });
  };

  const balance = parseFloat(balanceData?.balance || '0');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yêu cầu rút tiền</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Số tiền rút</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền"
              max={balance}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Số dư hiện tại: {balance.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>

          <div>
            <Label>Tên ngân hàng</Label>
            <Input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="VD: Vietcombank"
              required
            />
          </div>

          <div>
            <Label>Số tài khoản</Label>
            <Input
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="Nhập số tài khoản"
              required
            />
          </div>

          <div>
            <Label>Tên chủ tài khoản</Label>
            <Input
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              placeholder="Nhập tên chủ tài khoản"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createWithdrawal.isPending}
          >
            {createWithdrawal.isPending ? 'Đang xử lý...' : 'Tạo yêu cầu rút tiền'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## 6. Wallet Page

### `app/dashboard/wallet/page.tsx`

```typescript
'use client';

import { WalletBalanceCard } from '@/components/wallet/balance-card';
import { TransactionHistory } from '@/components/wallet/transaction-history';
import { WithdrawalForm } from '@/components/wallet/withdrawal-form';

export default function WalletPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Ví của tôi</h1>

      {/* Balance */}
      <WalletBalanceCard />

      {/* Withdrawal Form */}
      <WithdrawalForm />

      {/* Transaction History */}
      <TransactionHistory />
    </div>
  );
}
```

---

## ✅ Features Checklist

- ✅ Xem số dư ví real-time
- ✅ Lịch sử giao dịch với phân trang
- ✅ Filter theo loại (DEBIT/CREDIT)
- ✅ Tạo yêu cầu rút tiền
- ✅ Validation số tiền (không vượt quá số dư)
- ✅ Auto refresh sau khi tạo withdrawal
- ✅ Toast notifications

---

## 🔗 Next Steps

1. ✅ Build Contract module từ [42-CONTRACT-APPLICATION-FLOW.md](./42-CONTRACT-APPLICATION-FLOW.md)
2. ✅ Admin: Process withdrawals
3. ✅ Add withdrawal history page
