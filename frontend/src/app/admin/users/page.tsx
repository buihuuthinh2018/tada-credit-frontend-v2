"use client";

import { useState, useEffect } from "react";
import {
  useAdminUsers,
  useVerifyUser,
  useSuspendUser,
  useActivateUser,
} from "@/hooks/use-users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Search, MoreHorizontal, Eye, CheckCircle, XCircle, Play } from "lucide-react";
import Link from "next/link";
import { CopyableId } from "@/components/ui/copyable-id";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: users, isLoading } = useAdminUsers({
    page,
    limit: 10,
    ...(debouncedSearch && { search: debouncedSearch }),
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Quản lý Users</h1>
          <p className="text-gray-600">Xem và quản lý tất cả người dùng</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách Users</CardTitle>
              <CardDescription>
                Tổng cộng {users?.meta?.total || 0} người dùng
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm theo ID, tên, email, SĐT..."
                className="pl-8 w-full sm:w-72"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : users?.data && users.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Điện thoại</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-gray-500">
                        {(page - 1) * 10 + index + 1}
                      </TableCell>
                      <TableCell>
                        <CopyableId id={user.id} maxLength={8} />
                      </TableCell>
                      <TableCell>
                        {user.fullname}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles?.map((role, roleIndex) => (
                            <Badge key={role.id || roleIndex} variant="secondary">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/users/${user.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Xem chi tiết
                              </Link>
                            </DropdownMenuItem>
                            {user.status === 'PENDING_VERIFY' && (
                              <DropdownMenuItem
                                onClick={() => verifyUser.mutate(user.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Xác minh
                              </DropdownMenuItem>
                            )}
                            {user.status === 'ACTIVE' ? (
                              <DropdownMenuItem
                                onClick={() => suspendUser.mutate(user.id)}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Đình chỉ
                              </DropdownMenuItem>
                            ) : user.status === 'SUSPENDED' ? (
                              <DropdownMenuItem
                                onClick={() => activateUser.mutate(user.id)}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Kích hoạt
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trang trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {page} / {users.meta?.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!users.meta?.hasNextPage}
                >
                  Trang sau
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Không tìm thấy người dùng nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
