import { User } from "./auth";

export interface Wallet {
  id: number;
  userId: number;
  balance: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: number;
  walletId: number;
  transactionId: number;
  entryType: "DEBIT" | "CREDIT";
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface WalletTransaction extends LedgerEntry {
  wallet?: Wallet;
}

export interface WalletBalance {
  balance: string;
}

export enum WithdrawalStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface Withdrawal {
  id: number;
  userId: number;
  walletId: number;
  amount: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  status: WithdrawalStatus;
  note: string | null;
  processedBy: number | null;
  processedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface CreateWithdrawalRequest {
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  note?: string;
}

export interface ProcessWithdrawalRequest {
  action: "APPROVE" | "REJECT";
  note?: string;
}
