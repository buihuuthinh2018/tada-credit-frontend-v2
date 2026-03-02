// Revenue Statistics Types

export interface ContractDetail {
  id: string;
  contractNumber: string;
  createdAt: string;
  revenue: string;
  disbursement: string;
  revenuePercentage: string;
  creatorId: string | null;
  creator: {
    id: string;
    fullname: string | null;
    email: string;
  } | null;
}

export interface RevenuePeriodData {
  period: string;
  periodStart: string;
  periodEnd: string;
  revenue: string;
  disbursement: string;
  contractCount: number;
  averagePercentage: string;
  contracts: ContractDetail[];
}

export interface RevenueStatisticsResponse {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dateFrom: string;
  dateTo: string;
  data: RevenuePeriodData[];
  totals: {
    revenue: string;
    disbursement: string;
    contractCount: number;
    averagePercentage: string;
  };
}

export interface RevenueByUserData {
  user: {
    id: string;
    fullname: string | null;
    email: string;
    phone: string | null;
  };
  revenue: string;
  disbursement: string;
  contractCount: number;
  averagePercentage: string;
}

export interface RevenueByUserResponse {
  data: RevenueByUserData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totals: {
    revenue: string;
    disbursement: string;
    contractCount: number;
  };
  dateFrom: string;
  dateTo: string;
}
