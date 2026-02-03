"use client";

import { useState } from "react";
import {
  useAdminContracts,
  useAdminTransitionContract,
} from "@/hooks/use-contracts";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Eye } from "lucide-react";
import Link from "next/link";
import { ContractStatus } from "@/types";

export default function AdminContractsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">("all");

  const { data: contracts, isLoading } = useAdminContracts({
    page,
    limit: 10,
    ...(statusFilter !== "all" && { status: statusFilter }),
  });

  const getStatusBadge = (status: ContractStatus, stageName?: string) => {
    const variants: Record<ContractStatus, "default" | "secondary" | "success" | "destructive" | "warning"> = {
      ACTIVE: "secondary",
      COMPLETED: "success",
      CANCELLED: "destructive",
      REJECTED: "destructive",
    };
    return (
      <Badge variant={variants[status]}>
        {stageName || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Hồ sơ</h1>
        <p className="text-gray-600">Xem và duyệt các hồ sơ vay</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách Hồ sơ</CardTitle>
              <CardDescription>
                Tổng cộng {contracts?.total || 0} hồ sơ
              </CardDescription>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as ContractStatus | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="ACTIVE">Đang xử lý</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : contracts?.data && contracts.data.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.data.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        #{contract.id}
                      </TableCell>
                      <TableCell>
                        {contract.user?.firstName} {contract.user?.lastName}
                        <br />
                        <span className="text-sm text-gray-500">
                          {contract.user?.email}
                        </span>
                      </TableCell>
                      <TableCell>{contract.service?.name}</TableCell>
                      <TableCell>
                        {new Date(contract.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contract.status, contract.currentStage?.name)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/contracts/${contract.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Chi tiết
                          </Button>
                        </Link>
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
                  Trang {page} / {Math.ceil((contracts.total || 0) / 10)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil((contracts.total || 0) / 10)}
                >
                  Trang sau
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Không có hồ sơ nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
