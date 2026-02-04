import { User, Role } from "./auth";
import { Service } from "./service";

export interface CommissionConfig {
  id: string;
  serviceId: string;
  roleId: string | null;
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
  id: string;
  userId: string;
  contractId: string;
  commissionConfigId: string;
  amount: string;
  commissionRate: string;
  status: "PENDING" | "PAID";
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;

  user?: User;
  contract?: {
    id: string;
    service: { name: string };
  };
  commissionConfig?: CommissionConfig;
}

export interface CreateCommissionConfigRequest {
  serviceId: string;
  roleId?: string;
  commissionRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
}
