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
  wallet_id: string;
  type: "DEBIT" | "CREDIT";
  amount: string;
  reference_id: string | null;
  reference_type: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  balance_after: string;
  created_at: string;
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
