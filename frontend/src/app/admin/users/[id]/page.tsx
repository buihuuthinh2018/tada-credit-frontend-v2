"use client";

import { use } from "react";
import { useAdminUser, useRoles, useAssignRole, useRemoveRole, useVerifyUser, useSuspendUser, useActivateUser } from "@/hooks/use-users";
import { useRouter } from "next/navigation";
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
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Play,
  UserPlus,
  UserMinus,
} from "lucide-react";
import Link from "next/link";
import { CopyableId } from "@/components/ui/copyable-id";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Role } from "@/types";

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const { data: user, isLoading } = useAdminUser(id);
  const { data: rolesData } = useRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const verifyUser = useVerifyUser();
  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();

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

  const userRoleIds = user?.roles?.map(r => r.id) || [];
  // rolesData is array of Role[]
  const availableRoles: Role[] = (rolesData || []).filter((r: Role) => !userRoleIds.includes(r.id));

  const handleAssignRole = (roleId: string) => {
    assignRole.mutate({ userId: id, roleId }, {
      onSuccess: () => setIsRoleDialogOpen(false),
    });
  };

  const handleRemoveRole = (roleId: string) => {
    if (confirm("Bạn có chắc muốn xóa vai trò này khỏi người dùng?")) {
      removeRole.mutate({ userId: id, roleId });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy người dùng</p>
        <Button variant="link" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Chi tiết User</h1>
          <p className="text-gray-600">Thông tin chi tiết người dùng</p>
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <CardTitle className="text-xl">{user.fullname}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <CopyableId id={user.id} maxLength={12} />
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(user.status)}
              {user.status === 'PENDING_VERIFY' && (
                <Button
                  size="sm"
                  onClick={() => verifyUser.mutate(user.id)}
                  disabled={verifyUser.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Xác minh
                </Button>
              )}
              {user.status === 'ACTIVE' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => suspendUser.mutate(user.id)}
                  disabled={suspendUser.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Đình chỉ
                </Button>
              )}
              {user.status === 'SUSPENDED' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => activateUser.mutate(user.id)}
                  disabled={activateUser.isPending}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Kích hoạt
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Điện thoại</p>
                <p className="font-medium">{user.phone || "Chưa cập nhật"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                <p className="font-medium">
                  {user.updated_at ? new Date(user.updated_at).toLocaleDateString("vi-VN") : "—"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>Vai trò & Quyền hạn</CardTitle>
            </div>
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Thêm vai trò
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm vai trò cho người dùng</DialogTitle>
                  <DialogDescription>
                    Chọn vai trò để gán cho {user.fullname}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {availableRoles.length > 0 ? (
                    availableRoles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium">{role.name}</p>
                          <p className="text-sm text-gray-500">{role.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAssignRole(role.id)}
                          disabled={assignRole.isPending}
                        >
                          Gán
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      Người dùng đã có tất cả các vai trò
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {user.roles && user.roles.length > 0 ? (
            <div className="space-y-3">
              {user.roles.map((role, index) => (
                <div
                  key={role.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveRole(role.id)}
                    disabled={removeRole.isPending}
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Người dùng chưa được gán vai trò nào
            </p>
          )}
        </CardContent>
      </Card>

      {/* Referral Info */}
      {user.referred_by && (
        <Card>
          <CardHeader>
            <CardTitle>Người giới thiệu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">Mã giới thiệu:</p>
              <CopyableId id={user.referred_by} maxLength={12} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle>Mã giới thiệu</CardTitle>
          <CardDescription>Mã để người dùng giới thiệu bạn bè</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <code className="px-4 py-2 bg-gray-100 rounded-lg text-lg font-mono">
              {user.referral_code || "Chưa có"}
            </code>
            {user.referral_code && (
              <CopyableId id={user.referral_code} prefix="" maxLength={20} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
