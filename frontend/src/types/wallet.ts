import { User } from "./auth";

export interface Wallet {
  id: string;
  userId: string;
  balance: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  walletId: string;
  transactionId: string;
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
  APPROVED = "APPROVED",
  PAID = "PAID",
  REJECTED = "REJECTED",
}

export type WithdrawalMethod = 'BANKING' | 'CRYPTO';

export interface WithdrawalAccountInfo {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: string;
  method: WithdrawalMethod;
  account_info: WithdrawalAccountInfo | null;
  status: WithdrawalStatus;
  admin_note: string | null;
  proof_file_url: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  user?: User;
}

export interface CreateWithdrawalRequest {
  amount: number;
  method: WithdrawalMethod;
  accountInfo?: WithdrawalAccountInfo;
}

export interface ProcessWithdrawalRequest {
  status: WithdrawalStatus;
  adminNote?: string;
  proofFileUrl?: string;
}
