"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Award,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { formatVND } from "@/lib/utils";

// Types
interface CommissionRecord {
  id: string;
  contract_id: string;
  amount: string;
  rate: string;
  disbursement_amount: string | null;
  revenue_percentage: string | null;
  total_revenue: string | null;
  status: string;
  created_at: string;
  referred_user: {
    id: string;
    fullname: string;
    email: string;
  };
  contract: {
    id: string;
    contract_number: string;
    service: { name: string } | null;
    user: { fullname: string } | null;
  } | null;
}

interface CommissionSnapshot {
  id: string;
  period_month: number;
  period_year: number;
  total_contracts: number;
  total_disbursement: string;
  base_commission: string;
  bonus_commission: string;
  total_commission: string;
  status: string;
  kpi_tier?: { name: string };
}

interface CommissionSummary {
  totalEarned: string;
  pendingAmount: string;
  totalContracts: number;
  currentMonthContracts: number;
  currentMonthEarned: string;
  currentMonthDisbursement: string;
  currentKpiTier: { name: string } | null;
  referredUsers: number;
  walletBalance: string;
}

interface KpiTier {
  id: string;
  name: string;
  role_code: string;
  min_contracts: number | null;
  min_disbursement: string | null;
  bonus_amount: string;
  tier_order: number;
}

// API functions
const fetchMyCommissionSummary = async (): Promise<CommissionSummary> => {
  const response = await apiClient.get("/commission/summary");
  return response.data;
};

const fetchMyCommissions = async (page = 1, limit = 20) => {
  const response = await apiClient.get(`/commission/records?page=${page}&limit=${limit}`);
  return response.data;
};

const fetchMySnapshots = async (year?: number) => {
  const params = year ? `?year=${year}` : "";
  const response = await apiClient.get(`/commission/snapshots${params}`);
  return response.data;
};

const fetchKpiTiers = async (): Promise<KpiTier[]> => {
  const response = await apiClient.get("/commission/kpi-tiers");
  return response.data;
};

const formatDisbursementShort = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(0)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}tr`;
  return formatVND(value);
};

export default function CommissionDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Queries
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["my-commission-summary"],
    queryFn: fetchMyCommissionSummary,
  });

  const { data: commissionsData, isLoading: commissionsLoading } = useQuery({
    queryKey: ["my-commissions"],
    queryFn: () => fetchMyCommissions(),
  });

  const { data: snapshotsData, isLoading: snapshotsLoading } = useQuery({
    queryKey: ["my-snapshots", selectedYear],
    queryFn: () => fetchMySnapshots(selectedYear),
  });

  const { data: kpiTiers, isLoading: kpiLoading } = useQuery({
    queryKey: ["kpi-tiers"],
    queryFn: fetchKpiTiers,
  });

  const formatPercent = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${(num * 100).toFixed(2)}%`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CREDITED":
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã cộng ví</Badge>;
      case "PAID":
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã thanh toán</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      case "PROCESSED":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Đã xử lý</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTierIcon = (tierOrder: number) => {
    switch (tierOrder) {
      case 1: return "🥉";
      case 2: return "🥈";
      case 3: return "🥇";
      default: return "🏆";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Hoa hồng của tôi</h1>
        <p className="text-gray-600">
          Theo dõi thu nhập hoa hồng và KPI của bạn
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hoa hồng</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatVND(Number(summary?.totalEarned || 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tổng thu nhập từ hoa hồng
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ thanh toán</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">
                  {formatVND(Number(summary?.pendingAmount || 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Đang chờ xử lý vào ví
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tháng này</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {formatVND(Number(summary?.currentMonthEarned || 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.currentMonthContracts || 0} hợp đồng thành công
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KPI hiện tại</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {summary?.currentKpiTier?.name || "Chưa đạt"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Giải ngân: {formatVND(Number(summary?.currentMonthDisbursement || 0))}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Lịch sử giao dịch
          </TabsTrigger>
          <TabsTrigger value="snapshots" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Tổng kết hàng tháng
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Hoa hồng gần đây</CardTitle>
                <CardDescription>5 giao dịch gần nhất</CardDescription>
              </CardHeader>
              <CardContent>
                {commissionsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {commissionsData?.data?.slice(0, 5).map((record: CommissionRecord) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {record.contract?.contract_number || "N/A"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {record.contract?.service?.name || "-"} • Tỷ lệ {formatPercent(record.rate)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            +{formatVND(Number(record.amount))}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(record.created_at).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!commissionsData?.data || commissionsData.data.length === 0) && (
                      <p className="text-center text-gray-500 py-4">
                        Chưa có hoa hồng nào
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin KPI</CardTitle>
                <CardDescription>Các mức thưởng KPI bạn có thể đạt được</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      💡 Cách tính thưởng KPI
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Hệ thống tổng kết hoa hồng vào cuối mỗi tháng</li>
                      <li>• KPI được tính dựa trên số HĐ và tổng giải ngân</li>
                      <li>• Thưởng KPI là số tiền cố định theo tier đạt được</li>
                      <li>• Thưởng sẽ được cộng vào ví sau khi admin duyệt</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    {kpiLoading ? (
                      <>
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-14 w-full" />
                        ))}
                      </>
                    ) : kpiTiers && kpiTiers.length > 0 ? (
                      kpiTiers.map((tier) => (
                        <div key={tier.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getTierIcon(tier.tier_order)}</span>
                            <div>
                              <span className="font-medium">{tier.name}</span>
                              <p className="text-xs text-gray-500">
                                Thưởng: {formatVND(Number(tier.bonus_amount))}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {tier.min_contracts ? `≥ ${tier.min_contracts} HĐ` : ""}
                            {tier.min_contracts && tier.min_disbursement ? " và " : ""}
                            {tier.min_disbursement ? `≥ ${formatDisbursementShort(Number(tier.min_disbursement))}` : ""}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">
                        Chưa có cấu hình KPI
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hoa hồng</CardTitle>
              <CardDescription>
                Chi tiết các khoản hoa hồng bạn đã nhận được
              </CardDescription>
            </CardHeader>
            <CardContent>
              {commissionsLoading ? (
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Số hợp đồng</TableHead>
                      <TableHead>Dịch vụ</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Giải ngân</TableHead>
                      <TableHead>Tỷ lệ</TableHead>
                      <TableHead>Hoa hồng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissionsData?.data?.map((record: CommissionRecord) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.created_at).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="font-mono">
                          {record.contract?.contract_number || "-"}
                        </TableCell>
                        <TableCell>
                          {record.contract?.service?.name || "-"}
                        </TableCell>
                        <TableCell>
                          {record.contract?.user?.fullname || "-"}
                        </TableCell>
                        <TableCell>
                          {record.disbursement_amount
                            ? formatVND(Number(record.disbursement_amount))
                            : "-"}
                        </TableCell>
                        <TableCell>{formatPercent(record.rate)}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          +{formatVND(Number(record.amount))}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))}
                    {(!commissionsData?.data || commissionsData.data.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          Chưa có hoa hồng nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Snapshots Tab */}
        <TabsContent value="snapshots">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Tổng kết hàng tháng</CardTitle>
                <CardDescription>
                  Kết quả KPI và thưởng của bạn theo từng tháng
                </CardDescription>
              </div>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {snapshotsLoading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {snapshotsData?.data?.map((snapshot: CommissionSnapshot) => (
                    <div
                      key={snapshot.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              Tháng {snapshot.period_month}/{snapshot.period_year}
                            </p>
                            <p className="text-sm text-gray-500">
                              {snapshot.total_contracts} hợp đồng • Giải ngân{" "}
                              {formatVND(Number(snapshot.total_disbursement))}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {formatVND(Number(snapshot.total_commission))}
                          </p>
                          {getStatusBadge(snapshot.status)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 pt-3 border-t">
                        <div>
                          <p className="text-xs text-gray-500">Hoa hồng cơ bản</p>
                          <p className="font-medium">
                            {formatVND(Number(snapshot.base_commission))}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">KPI Tier</p>
                          <p className="font-medium">
                            {snapshot.kpi_tier?.name || "Chưa đạt"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Thưởng KPI</p>
                          <p className="font-medium text-green-600">
                            +{formatVND(Number(snapshot.bonus_commission))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!snapshotsData?.data || snapshotsData.data.length === 0) && (
                    <p className="text-center text-gray-500 py-8">
                      Chưa có tổng kết nào cho năm {selectedYear}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
