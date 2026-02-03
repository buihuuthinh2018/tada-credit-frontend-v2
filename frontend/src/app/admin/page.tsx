"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAdminUsers } from "@/hooks/use-users";
import { useAdminContracts } from "@/hooks/use-contracts";
import { useAdminWithdrawals } from "@/hooks/use-withdrawals";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, CreditCard, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers({
    page: 1,
    limit: 1,
  });
  const { data: contractsData, isLoading: contractsLoading } = useAdminContracts({
    page: 1,
    limit: 1,
  });
  const { data: withdrawalsData, isLoading: withdrawalsLoading } =
    useAdminWithdrawals({ page: 1, limit: 5, status: "PENDING" as never });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">
          Xin chào, {user?.firstName} {user?.lastName}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{usersData?.total || 0}</div>
            )}
            <Link href="/admin/users">
              <Button variant="link" className="p-0 h-auto text-sm">
                Xem chi tiết →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Contracts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Hồ sơ</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {contractsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {contractsData?.total || 0}
              </div>
            )}
            <Link href="/admin/contracts">
              <Button variant="link" className="p-0 h-auto text-sm">
                Xem chi tiết →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chờ rút tiền
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {withdrawalsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">
                {withdrawalsData?.total || 0}
              </div>
            )}
            <Link href="/admin/withdrawals">
              <Button variant="link" className="p-0 h-auto text-sm">
                Xem chi tiết →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Growth */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tăng trưởng</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12%</div>
            <p className="text-xs text-muted-foreground">So với tháng trước</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quản lý Users</CardTitle>
            <CardDescription>
              Xem và quản lý tất cả người dùng trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Quản lý Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Duyệt Hồ sơ</CardTitle>
            <CardDescription>
              Xem và duyệt các hồ sơ vay đang chờ xử lý
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/contracts">
              <Button className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Duyệt Hồ sơ
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Xử lý Rút tiền</CardTitle>
            <CardDescription>
              Xem và xử lý các yêu cầu rút tiền đang chờ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/withdrawals">
              <Button className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                Xử lý Rút tiền
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
