import { User, Role } from "./auth";
import { Service } from "./service";

export interface CommissionConfig {
  id: number;
  serviceId: number;
  roleId: number | null;
  commissionRate: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;

  service?: Service;
  role?: Role;
}

export interface CommissionHistory {
  id: number;
  userId: number;
  contractId: number;
  commissionConfigId: number;
  amount: string;
  commissionRate: string;
  status: "PENDING" | "PAID";
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;

  user?: User;
  contract?: {
    id: number;
    service: { name: string };
  };
  commissionConfig?: CommissionConfig;
}

export interface CreateCommissionConfigRequest {
  serviceId: number;
  roleId?: number;
  commissionRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
}
