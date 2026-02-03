"use client";

import { useAuth } from "@/hooks/use-auth";
import { useWalletBalance } from "@/hooks/use-wallet";
import { useContracts } from "@/hooks/use-contracts";
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
import Link from "next/link";
import { Wallet, FileText, Users, DollarSign, Plus } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: balance, isLoading: balanceLoading } = useWalletBalance();
  const { data: contracts, isLoading: contractsLoading } = useContracts({
    page: 1,
    limit: 5,
  });

  const walletBalance = parseFloat(balance?.balance || "0");

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Xin chào, {user?.firstName} {user?.lastName}!
        </h1>
        <p className="text-gray-600">
          Chào mừng bạn đến với TADA Credit Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Wallet Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số dư ví</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {walletBalance.toLocaleString("vi-VN")} VNĐ
              </div>
            )}
            <Link href="/dashboard/wallet">
              <Button variant="link" className="p-0 h-auto text-sm">
                Xem chi tiết →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Contracts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hồ sơ</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {contractsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{contracts?.total || 0}</div>
            )}
            <Link href="/dashboard/contracts">
              <Button variant="link" className="p-0 h-auto text-sm">
                Xem tất cả →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Referral Code */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mã giới thiệu</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {user?.referralCode || "---"}
            </div>
            <p className="text-xs text-muted-foreground">
              Chia sẻ để nhận hoa hồng
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hành động</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/contracts/new">
              <Button size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Tạo hồ sơ mới
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Contracts */}
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ gần đây</CardTitle>
          <CardDescription>
            Danh sách các hồ sơ vay gần đây của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contractsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : contracts?.data && contracts.data.length > 0 ? (
            <div className="space-y-4">
              {contracts.data.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Hồ sơ #{contract.id}</p>
                    <p className="text-sm text-gray-500">
                      {contract.service?.name || "Dịch vụ"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        contract.status === "COMPLETED"
                          ? "success"
                          : contract.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {contract.currentStage?.name || contract.status}
                    </Badge>
                    <Link href={`/dashboard/contracts/${contract.id}`}>
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có hồ sơ nào</p>
              <Link href="/dashboard/contracts/new">
                <Button className="mt-4">Tạo hồ sơ đầu tiên</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
