"use client";

import { useState } from "react";
import {
  useAdminWithdrawals,
  useProcessWithdrawal,
} from "@/hooks/use-withdrawals";
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
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, CheckCircle, XCircle } from "lucide-react";
import { WithdrawalStatus, Withdrawal } from "@/types";

export default function AdminWithdrawalsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | "all">("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [processAction, setProcessAction] = useState<WithdrawalStatus | null>(null);
  const [processNote, setProcessNote] = useState("");

  const { data: withdrawals, isLoading } = useAdminWithdrawals({
    page,
    limit: 10,
    ...(statusFilter !== "all" && { status: statusFilter }),
  });

  const processWithdrawal = useProcessWithdrawal();

  const handleProcess = () => {
    if (!selectedWithdrawal || !processAction) return;

    processWithdrawal.mutate(
      {
        id: selectedWithdrawal.id,
        data: {
          status: processAction,
          ...(processNote && { adminNote: processNote }),
        },
      },
      {
        onSuccess: () => {
          setSelectedWithdrawal(null);
          setProcessAction(null);
          setProcessNote("");
        },
      }
    );
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    const variants: Record<WithdrawalStatus, "default" | "secondary" | "success" | "destructive" | "warning"> = {
      PENDING: "warning",
      APPROVED: "secondary",
      PAID: "success",
      REJECTED: "destructive",
    };
    const labels: Record<WithdrawalStatus, string> = {
      PENDING: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      PAID: "Đã thanh toán",
      REJECTED: "Từ chối",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Rút tiền</h1>
        <p className="text-gray-600">Xem và xử lý các yêu cầu rút tiền</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách yêu cầu rút tiền</CardTitle>
              <CardDescription>
                Tổng cộng {withdrawals?.meta?.total || 0} yêu cầu
              </CardDescription>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as WithdrawalStatus | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
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
          ) : withdrawals?.data && withdrawals.data.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Ngân hàng</TableHead>
                    <TableHead>Số TK</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.data.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="font-medium">
                        #{withdrawal.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {withdrawal.user?.fullname}
                        <br />
                        <span className="text-sm text-gray-500">
                          {withdrawal.user?.email}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {parseFloat(withdrawal.amount).toLocaleString("vi-VN")} VNĐ
                      </TableCell>
                      <TableCell>
                        {withdrawal.method === 'BANKING' ? withdrawal.account_info?.bankName : 'Crypto'}
                      </TableCell>
                      <TableCell>
                        {withdrawal.method === 'BANKING' ? (
                          <>
                            {withdrawal.account_info?.accountNumber}
                            <br />
                            <span className="text-sm text-gray-500">
                              {withdrawal.account_info?.accountHolder}
                            </span>
                          </>
                        ) : (
                          <>
                            {withdrawal.account_info?.cryptoAddress?.slice(0, 10)}...
                            <br />
                            <span className="text-sm text-gray-500">
                              {withdrawal.account_info?.cryptoNetwork}
                            </span>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(withdrawal.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell>
                        {withdrawal.status === WithdrawalStatus.PENDING && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setProcessAction(WithdrawalStatus.APPROVED);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setProcessAction(WithdrawalStatus.REJECTED);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Từ chối
                            </Button>
                          </div>
                        )}
                        {withdrawal.status === WithdrawalStatus.APPROVED && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setProcessAction(WithdrawalStatus.PAID);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Đã thanh toán
                          </Button>
                        )}
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
                  Trang {page} / {withdrawals.meta?.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!withdrawals.meta?.hasNextPage}
                >
                  Trang sau
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Không có yêu cầu rút tiền nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Dialog */}
      <Dialog
        open={!!selectedWithdrawal && !!processAction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedWithdrawal(null);
            setProcessAction(null);
            setProcessNote("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processAction === WithdrawalStatus.APPROVED && "Duyệt yêu cầu rút tiền"}
              {processAction === WithdrawalStatus.REJECTED && "Từ chối yêu cầu rút tiền"}
              {processAction === WithdrawalStatus.PAID && "Xác nhận đã thanh toán"}
            </DialogTitle>
            <DialogDescription>
              {processAction === WithdrawalStatus.APPROVED && "Bạn có chắc chắn muốn duyệt yêu cầu rút tiền này?"}
              {processAction === WithdrawalStatus.REJECTED && "Bạn có chắc chắn muốn từ chối yêu cầu rút tiền này?"}
              {processAction === WithdrawalStatus.PAID && "Bạn có chắc chắn đã thanh toán cho yêu cầu này?"}
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <p>
                  <strong>Số tiền:</strong>{" "}
                  {parseFloat(selectedWithdrawal.amount).toLocaleString("vi-VN")} VNĐ
                </p>
                <p>
                  <strong>Phương thức:</strong> {selectedWithdrawal.method === 'BANKING' ? 'Chuyển khoản ngân hàng' : 'Crypto'}
                </p>
                {selectedWithdrawal.method === 'BANKING' ? (
                  <>
                    <p>
                      <strong>Ngân hàng:</strong> {selectedWithdrawal.account_info?.bankName}
                    </p>
                    <p>
                      <strong>Số TK:</strong> {selectedWithdrawal.account_info?.accountNumber}
                    </p>
                    <p>
                      <strong>Chủ TK:</strong> {selectedWithdrawal.account_info?.accountHolder}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Địa chỉ:</strong> {selectedWithdrawal.account_info?.cryptoAddress}
                    </p>
                    <p>
                      <strong>Mạng:</strong> {selectedWithdrawal.account_info?.cryptoNetwork}
                    </p>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ghi chú (tùy chọn)</label>
                <Textarea
                  value={processNote}
                  onChange={(e) => setProcessNote(e.target.value)}
                  placeholder="Nhập ghi chú..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedWithdrawal(null);
                setProcessAction(null);
                setProcessNote("");
              }}
            >
              Hủy
            </Button>
            <Button
              variant={processAction === WithdrawalStatus.REJECTED ? "destructive" : "default"}
              onClick={handleProcess}
              disabled={processWithdrawal.isPending}
            >
              {processWithdrawal.isPending
                ? "Đang xử lý..."
                : processAction === WithdrawalStatus.APPROVED
                ? "Duyệt"
                : processAction === WithdrawalStatus.PAID
                ? "Xác nhận đã thanh toán"
                : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
