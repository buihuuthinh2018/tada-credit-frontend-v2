"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cài đặt Admin</h1>
        <p className="text-gray-600">Quản lý cài đặt hệ thống</p>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Thông tin Admin hiện tại
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Họ tên</p>
              <p className="font-medium">
                {user?.fullname}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Số điện thoại</p>
              <p className="font-medium">{user?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vai trò</p>
              <div className="flex gap-1 mt-1">
                {user?.roles?.map((role, index) => (
                  <Badge key={role.id || `role-${index}`} variant="secondary">
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Thông tin hệ thống
          </CardTitle>
          <CardDescription>
            Các cài đặt và thông tin về hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Version</p>
                <p className="text-sm text-gray-500">Phiên bản hệ thống</p>
              </div>
              <Badge>v1.0.0</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Environment</p>
                <p className="text-sm text-gray-500">Môi trường hiện tại</p>
              </div>
              <Badge variant="secondary">Development</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
