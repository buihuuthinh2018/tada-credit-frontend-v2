import { PaginationParams } from "./api";
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
  userId?: string;
  serviceId?: string;
  stageCode?: string; // Dynamic stage code from workflow
}

export interface WithdrawalFilters extends PaginationParams {
  userId?: string;
  status?: WithdrawalStatus;
}
