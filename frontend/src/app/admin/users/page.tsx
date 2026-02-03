"use client";

import { useState } from "react";
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

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useAdminUsers({
    page,
    limit: 10,
    ...(search && { search }),
  });

  const verifyUser = useVerifyUser();
  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Users</h1>
          <p className="text-gray-600">Xem và quản lý tất cả người dùng</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách Users</CardTitle>
              <CardDescription>
                Tổng cộng {users?.total || 0} người dùng
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Tìm kiếm..."
                  className="pl-8 w-64"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
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
                  {users.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">#{user.id}</TableCell>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles?.map((role) => (
                            <Badge key={role.id} variant="secondary">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.isVerified ? (
                            <Badge variant="success">Đã xác minh</Badge>
                          ) : (
                            <Badge variant="warning">Chưa xác minh</Badge>
                          )}
                          {user.isActive ? (
                            <Badge variant="default">Hoạt động</Badge>
                          ) : (
                            <Badge variant="destructive">Đã khóa</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
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
                            {!user.isVerified && (
                              <DropdownMenuItem
                                onClick={() => verifyUser.mutate(user.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Xác minh
                              </DropdownMenuItem>
                            )}
                            {user.isActive ? (
                              <DropdownMenuItem
                                onClick={() => suspendUser.mutate(user.id)}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Đình chỉ
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => activateUser.mutate(user.id)}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Kích hoạt
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trang trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {page} / {Math.ceil((users.total || 0) / 10)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil((users.total || 0) / 10)}
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
