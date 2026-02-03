import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  Wallet,
  WalletBalance,
  LedgerEntry,
  PaginatedResponse,
} from "@/types";

// Get wallet info
export function useWallet() {
  return useQuery<Wallet>({
    queryKey: ["wallet"],
    queryFn: async () => {
      const { data } = await apiClient.get("/wallet");
      return data;
    },
  });
}

// Get wallet balance
export function useWalletBalance() {
  return useQuery<WalletBalance>({
    queryKey: ["wallet", "balance"],
    queryFn: async () => {
      const { data } = await apiClient.get("/wallet/balance");
      return data;
    },
  });
}

// Get transactions (ledger entries)
export function useWalletTransactions(params?: {
  page?: number;
  limit?: number;
  entryType?: "DEBIT" | "CREDIT";
}) {
  return useQuery<PaginatedResponse<LedgerEntry>>({
    queryKey: ["wallet", "transactions", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/wallet/transactions", { params });
      return data;
    },
  });
}
