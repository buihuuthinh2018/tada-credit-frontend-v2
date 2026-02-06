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
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Wallet,
  FileText,
  Users,
  DollarSign,
  Plus,
  ArrowRight,
  Copy,
  Check,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { StageBadge } from "@/components/ui/stage-badge";
import { useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: balance, isLoading: balanceLoading } = useWalletBalance();
  const { data: contracts, isLoading: contractsLoading } = useContracts({
    page: 1,
    limit: 5,
  });
  const [copied, setCopied] = useState(false);

  const walletBalance = parseFloat(balance?.balance || "0");

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome — compact on mobile */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Xin chào, {user?.fullname?.split(" ").pop()}! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Chào mừng bạn quay lại TADA Credit
        </p>
      </div>

      {/* Wallet Balance Card — prominent on mobile */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-blue-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Số dư ví</span>
          </div>
          <Link href="/dashboard/wallet">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 h-8 px-3"
            >
              Chi tiết <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        {balanceLoading ? (
          <Skeleton className="h-9 w-48 bg-white/20" />
        ) : (
          <div className="text-3xl sm:text-4xl font-bold tracking-tight">
            {walletBalance.toLocaleString("vi-VN")}
            <span className="text-lg font-normal opacity-80 ml-1">VNĐ</span>
          </div>
        )}
      </div>

      {/* Quick Stats Grid — 2 cols on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link href="/dashboard/contracts" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5 text-blue-600" />
                </div>
              </div>
              {contractsLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {contracts?.meta?.total || 0}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-0.5">Tổng hồ sơ</p>
            </CardContent>
          </Card>
        </Link>

        <div onClick={copyReferralCode} className="cursor-pointer">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                  <Users className="w-4.5 h-4.5 text-violet-600" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold font-mono text-gray-900 truncate">
                  {user?.referral_code || "---"}
                </span>
                {copied ? (
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Mã giới thiệu</p>
            </CardContent>
          </Card>
        </div>

        <Link
          href="/dashboard/commission"
          className="block col-span-2 sm:col-span-1"
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">Hoa hồng</div>
              <p className="text-xs text-gray-500 mt-0.5">
                Xem chi tiết KPI & thu nhập
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Action — hidden on desktop (sidebar has it) */}
      <div className="md:hidden">
        <Link href="/dashboard/contracts/new">
          <Button className="w-full h-12 text-base bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm">
            <Plus className="w-5 h-5 mr-2" />
            Tạo hồ sơ mới
          </Button>
        </Link>
      </div>

      {/* Recent Contracts */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Hồ sơ gần đây</CardTitle>
            <Link href="/dashboard/contracts">
              <Button variant="ghost" size="sm" className="text-blue-600 h-8">
                Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {contractsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : contracts?.data && contracts.data.length > 0 ? (
            <div className="space-y-2">
              {contracts.data.map((contract) => (
                <Link
                  key={contract.id}
                  href={`/dashboard/contracts/${contract.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors active:bg-gray-100">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base text-gray-900 truncate">
                        #{contract.contract_number}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {contract.service?.name || "Dịch vụ"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <StageBadge stage={contract.stage} />
                      <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 mb-4">Chưa có hồ sơ nào</p>
              <Link href="/dashboard/contracts/new">
                <Button className="bg-linear-to-r from-blue-600 to-indigo-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo hồ sơ đầu tiên
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
