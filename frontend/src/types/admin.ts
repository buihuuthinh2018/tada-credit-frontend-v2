import { PaginationParams } from "./api";
import { ContractStatus } from "./contract";
import { WithdrawalStatus } from "./wallet";

export interface UserFilters extends PaginationParams {
  search?: string;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ContractFilters extends PaginationParams {
  userId?: number;
  serviceId?: number;
  status?: ContractStatus;
}

export interface WithdrawalFilters extends PaginationParams {
  userId?: number;
  status?: WithdrawalStatus;
}
