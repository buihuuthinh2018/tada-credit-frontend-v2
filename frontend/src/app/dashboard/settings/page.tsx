"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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
import { User, Shield, Lock, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      toast.success("Đã sao chép mã giới thiệu!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
              <Label>Họ</Label>
              <Input value={user?.firstName || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Tên</Label>
              <Input value={user?.lastName || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input value={user?.phone || ""} disabled />
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
                value={user?.referralCode || ""}
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
              <Badge variant={user?.isVerified ? "success" : "warning"}>
                {user?.isVerified ? "Đã xác minh" : "Chưa xác minh"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Trạng thái tài khoản</p>
                <p className="text-sm text-gray-500">
                  Tài khoản của bạn có đang hoạt động
                </p>
              </div>
              <Badge variant={user?.isActive ? "success" : "destructive"}>
                {user?.isActive ? "Hoạt động" : "Đã khóa"}
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
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                  : "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
