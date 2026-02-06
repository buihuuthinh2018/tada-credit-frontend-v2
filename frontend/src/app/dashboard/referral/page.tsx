"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUserQuery } from "@/hooks/use-users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Copy,
  Check,
  Share2,
  TrendingUp,
  DollarSign,
  FileText,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

// Types
interface ReferredUser {
  id: string;
  email: string;
  fullname: string;
  status: string;
  created_at: string;
}

interface ReferralsResponse {
  data: ReferredUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CommissionSummary {
  totalEarned: number | { toString: () => string };
  currentMonth: {
    contracts: number;
    commission: number | { toString: () => string };
    disbursement: number | { toString: () => string };
  };
  referredUsers: number;
  walletBalance: number | { toString: () => string };
}

// API functions
const fetchMyReferrals = async (page = 1, limit = 10): Promise<ReferralsResponse> => {
  const { data } = await apiClient.get(`/users/me/referrals?page=${page}&limit=${limit}`);
  return data;
};

const fetchCommissionSummary = async (): Promise<CommissionSummary> => {
  const { data } = await apiClient.get("/commission/summary");
  return data;
};

export default function ReferralPage() {
  const { data: user, isLoading: userLoading } = useCurrentUserQuery();
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);

  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ["my-referrals", page],
    queryFn: () => fetchMyReferrals(page),
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["commission-summary"],
    queryFn: fetchCommissionSummary,
  });

  // Check if user is CTV
  const isCTV = user?.roles?.some((r) => r.code === "CTV");

  const referralLink = user?.referral_code
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${user.referral_code}`
    : "";

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setCopied(true);
      toast.success("Đã sao chép mã giới thiệu!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success("Đã sao chép link giới thiệu!");
    }
  };

  const formatCurrency = (value: number | { toString: () => string }) => {
    const num = typeof value === "object" ? parseFloat(value.toString()) : value;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num || 0);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "destructive"> = {
      ACTIVE: "success",
      PENDING_VERIFY: "warning",
      SUSPENDED: "destructive",
    };
    const labels: Record<string, string> = {
      ACTIVE: "Hoạt động",
      PENDING_VERIFY: "Chờ xác minh",
      SUSPENDED: "Đã khóa",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  // Show loading state if user is still loading
  if (userLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Giới thiệu</h1>
        <p className="text-gray-600">
          {isCTV
            ? "Quản lý người được giới thiệu và theo dõi hoa hồng"
            : "Giới thiệu bạn bè và nhận thưởng"}
        </p>
      </div>

      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Mã giới thiệu của bạn
          </CardTitle>
          <CardDescription>
            Chia sẻ mã này để giới thiệu người dùng mới
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={user?.referral_code || ""}
                readOnly
                className="font-mono text-xl text-center font-bold"
              />
            </div>
            <Button onClick={copyReferralCode} variant="outline">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input value={referralLink} readOnly className="text-sm" />
            <Button onClick={copyReferralLink} variant="secondary" size="sm">
              Sao chép link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người được giới thiệu</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{summary?.referredUsers || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hồ sơ tháng này</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{summary?.currentMonth?.contracts || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoa hồng tháng này</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary?.currentMonth?.commission || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hoa hồng</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary?.totalEarned || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTV KPI Info */}
      {isCTV && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Thông tin CTV
            </CardTitle>
            <CardDescription>
              KPI và tỷ lệ hoa hồng của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Vai trò</p>
                <p className="text-xl font-bold">CTV</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Giải ngân tháng này</p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary?.currentMonth?.disbursement || 0)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Số dư ví</p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary?.walletBalance || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referred Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Danh sách người được giới thiệu
          </CardTitle>
          <CardDescription>
            Tổng cộng {referrals?.meta?.total || 0} người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : referrals?.data && referrals.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đăng ký</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullname}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {/* Pagination */}
              {referrals.meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Trước
                  </Button>
                  <span className="flex items-center px-4 text-sm">
                    Trang {page} / {referrals.meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= referrals.meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Chưa có ai được giới thiệu</p>
              <p className="text-sm text-gray-400 mt-2">
                Chia sẻ mã giới thiệu để bắt đầu
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
