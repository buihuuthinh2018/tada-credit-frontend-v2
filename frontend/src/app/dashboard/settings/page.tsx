"use client";

import { useState } from "react";
import { useCurrentUserQuery } from "@/hooks/use-users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Shield, Lock, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function DashboardSettingsPage() {
  const { data: user, isLoading } = useCurrentUserQuery();
  const [copied, setCopied] = useState(false);

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setCopied(true);
      toast.success("Đã sao chép mã giới thiệu!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to check user status
  const isVerified = user?.status === "ACTIVE" || user?.status === "PENDING_VERIFY";
  const isActive = user?.status === "ACTIVE";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cài đặt</h1>
        <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>Thông tin tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input value={user?.fullname || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input value={user?.phone || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Giới tính</Label>
              <Input value={user?.gender === "MALE" ? "Nam" : user?.gender === "FEMALE" ? "Nữ" : "Khác"} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Mã giới thiệu
          </CardTitle>
          <CardDescription>
            Chia sẻ mã này để nhận hoa hồng khi có người đăng ký
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={user?.referral_code || ""}
                readOnly
                className="font-mono text-lg"
              />
            </div>
            <Button onClick={copyReferralCode} variant="outline">
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "Đã sao chép" : "Sao chép"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Trạng thái tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Xác minh email</p>
                <p className="text-sm text-gray-500">
                  Trạng thái xác minh email của bạn
                </p>
              </div>
              <Badge variant={isVerified ? "success" : "warning"}>
                {isVerified ? "Đã xác minh" : "Chưa xác minh"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Trạng thái tài khoản</p>
                <p className="text-sm text-gray-500">
                  Tài khoản của bạn có đang hoạt động
                </p>
              </div>
              <Badge variant={isActive ? "success" : "destructive"}>
                {isActive ? "Hoạt động" : user?.status === "SUSPENDED" ? "Đã khóa" : "Chờ xác minh"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Ngày đăng ký</p>
                <p className="text-sm text-gray-500">
                  Ngày bạn tạo tài khoản
                </p>
              </div>
              <span className="font-medium">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("vi-VN")
                  : "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
