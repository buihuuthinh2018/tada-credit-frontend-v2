"use client";

import { useState } from "react";
import { useWalletBalance, useWalletTransactions } from "@/hooks/use-wallet";
import { useWithdrawals, useCreateWithdrawal, useCancelWithdrawal } from "@/hooks/use-withdrawals";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet, ArrowUpCircle, ArrowDownCircle, XCircle } from "lucide-react";
import { WithdrawalStatus } from "@/types";

export default function WalletPage() {
  const [page, setPage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
  });

  const { data: balance, isLoading: balanceLoading } = useWalletBalance();
  const { data: transactions, isLoading: transactionsLoading } = useWalletTransactions({
    page,
    limit: 10,
  });
  const { data: withdrawals, isLoading: withdrawalsLoading } = useWithdrawals({
    page: withdrawalPage,
    limit: 10,
  });

  const createWithdrawal = useCreateWithdrawal();
  const cancelWithdrawal = useCancelWithdrawal();

  const walletBalance = parseFloat(balance?.balance || "0");

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWithdrawal.mutate(
      {
        amount: parseFloat(withdrawalForm.amount),
        bankName: withdrawalForm.bankName,
        bankAccountNumber: withdrawalForm.bankAccountNumber,
        bankAccountName: withdrawalForm.bankAccountName,
      },
      {
        onSuccess: () => {
          setIsWithdrawDialogOpen(false);
          setWithdrawalForm({
            amount: "",
            bankName: "",
            bankAccountNumber: "",
            bankAccountName: "",
          });
        },
      }
    );
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    const variants: Record<WithdrawalStatus, "default" | "secondary" | "success" | "destructive" | "warning"> = {
      PENDING: "warning",
      PROCESSING: "secondary",
      COMPLETED: "success",
      FAILED: "destructive",
      CANCELLED: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ví của tôi</h1>

      {/* Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Số dư hiện tại</CardTitle>
            <CardDescription>Số tiền có sẵn trong ví</CardDescription>
          </div>
          <Wallet className="h-8 w-8 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          {balanceLoading ? (
            <Skeleton className="h-12 w-48" />
          ) : (
            <div className="text-4xl font-bold text-green-600">
              {walletBalance.toLocaleString("vi-VN")} VNĐ
            </div>
          )}
          <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Rút tiền
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yêu cầu rút tiền</DialogTitle>
                <DialogDescription>
                  Nhập thông tin ngân hàng để rút tiền từ ví
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Số tiền rút</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={withdrawalForm.amount}
                    onChange={(e) =>
                      setWithdrawalForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    max={walletBalance}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Số dư khả dụng: {walletBalance.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Tên ngân hàng</Label>
                  <Input
                    placeholder="VD: Vietcombank"
                    value={withdrawalForm.bankName}
                    onChange={(e) =>
                      setWithdrawalForm((prev) => ({
                        ...prev,
                        bankName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số tài khoản</Label>
                  <Input
                    placeholder="Nhập số tài khoản"
                    value={withdrawalForm.bankAccountNumber}
                    onChange={(e) =>
                      setWithdrawalForm((prev) => ({
                        ...prev,
                        bankAccountNumber: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tên chủ tài khoản</Label>
                  <Input
                    placeholder="Nhập tên chủ tài khoản"
                    value={withdrawalForm.bankAccountName}
                    onChange={(e) =>
                      setWithdrawalForm((prev) => ({
                        ...prev,
                        bankAccountName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsWithdrawDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={createWithdrawal.isPending}>
                    {createWithdrawal.isPending ? "Đang xử lý..." : "Tạo yêu cầu"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Tabs for Transactions and Withdrawals */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Lịch sử giao dịch</TabsTrigger>
          <TabsTrigger value="withdrawals">Yêu cầu rút tiền</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử giao dịch</CardTitle>
              <CardDescription>
                Danh sách các giao dịch trong ví của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : transactions?.data && transactions.data.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Số dư sau</TableHead>
                        <TableHead>Mô tả</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.data.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {new Date(tx.createdAt).toLocaleDateString("vi-VN")}
                          </TableCell>
                          <TableCell>
                            {tx.entryType === "CREDIT" ? (
                              <Badge variant="success" className="gap-1">
                                <ArrowDownCircle className="w-3 h-3" />
                                Cộng
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <ArrowUpCircle className="w-3 h-3" />
                                Trừ
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell
                            className={
                              tx.entryType === "CREDIT"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {tx.entryType === "CREDIT" ? "+" : "-"}
                            {parseFloat(tx.amount).toLocaleString("vi-VN")} VNĐ
                          </TableCell>
                          <TableCell>
                            {parseFloat(tx.balanceAfter).toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </TableCell>
                          <TableCell>{tx.description}</TableCell>
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
                      Trang {page} / {Math.ceil((transactions.total || 0) / 10)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= Math.ceil((transactions.total || 0) / 10)}
                    >
                      Trang sau
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có giao dịch nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu rút tiền</CardTitle>
              <CardDescription>
                Danh sách các yêu cầu rút tiền của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : withdrawals?.data && withdrawals.data.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Ngân hàng</TableHead>
                        <TableHead>Số TK</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.data.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>
                            {new Date(withdrawal.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {parseFloat(withdrawal.amount).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </TableCell>
                          <TableCell>{withdrawal.bankName}</TableCell>
                          <TableCell>{withdrawal.bankAccountNumber}</TableCell>
                          <TableCell>
                            {getStatusBadge(withdrawal.status)}
                          </TableCell>
                          <TableCell>
                            {withdrawal.status === WithdrawalStatus.PENDING && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  cancelWithdrawal.mutate(withdrawal.id)
                                }
                                disabled={cancelWithdrawal.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Hủy
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
                      onClick={() => setWithdrawalPage((p) => Math.max(1, p - 1))}
                      disabled={withdrawalPage === 1}
                    >
                      Trang trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Trang {withdrawalPage} /{" "}
                      {Math.ceil((withdrawals.total || 0) / 10)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setWithdrawalPage((p) => p + 1)}
                      disabled={
                        withdrawalPage >= Math.ceil((withdrawals.total || 0) / 10)
                      }
                    >
                      Trang sau
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có yêu cầu rút tiền nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
