"use client";

import { useState, useEffect } from "react";
import { useWalletBalance, useWalletTransactions } from "@/hooks/use-wallet";
import { useWithdrawals, useCreateWithdrawal, useCancelWithdrawal } from "@/hooks/use-withdrawals";
import { formatVND } from "@/lib/utils";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Wallet, ArrowUpCircle, ArrowDownCircle, XCircle, Landmark, Bitcoin, RefreshCw } from "lucide-react";
import { WithdrawalStatus } from "@/types";

// USDT Exchange Rate (can be fetched from API in production)
const USDT_VND_RATE = 25500; // 1 USDT = 25,500 VND

export default function WalletPage() {
  const [page, setPage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<"BANKING" | "CRYPTO">("BANKING");
  const [usdtRate, setUsdtRate] = useState(USDT_VND_RATE);
  
  // Banking form
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
  });

  // Crypto form
  const [cryptoForm, setCryptoForm] = useState({
    amount: "",
    walletAddress: "",
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

  // Calculate USDT equivalent
  const usdtEquivalent = cryptoForm.amount 
    ? (parseFloat(cryptoForm.amount) / usdtRate).toFixed(2) 
    : "0";

  const handleBankingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWithdrawal.mutate(
      {
        amount: parseFloat(withdrawalForm.amount),
        method: "BANKING" as const,
        accountInfo: {
          bankName: withdrawalForm.bankName,
          accountNumber: withdrawalForm.bankAccountNumber,
          accountHolder: withdrawalForm.bankAccountName,
        },
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

  const handleCryptoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWithdrawal.mutate(
      {
        amount: parseFloat(cryptoForm.amount),
        method: "CRYPTO" as const,
        accountInfo: {
          cryptoAddress: cryptoForm.walletAddress,
          cryptoNetwork: "TRC-20",
        },
      },
      {
        onSuccess: () => {
          setIsWithdrawDialogOpen(false);
          setCryptoForm({
            amount: "",
            walletAddress: "",
          });
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

  const getMethodBadge = (method: string) => {
    if (method === "CRYPTO") {
      return <Badge variant="secondary" className="gap-1"><Bitcoin className="w-3 h-3" />USDT</Badge>;
    }
    return <Badge variant="outline" className="gap-1"><Landmark className="w-3 h-3" />Banking</Badge>;
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
              {formatVND(walletBalance)}
            </div>
          )}
          <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Rút tiền
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Yêu cầu rút tiền</DialogTitle>
                <DialogDescription>
                  Chọn phương thức và nhập thông tin để rút tiền
                </DialogDescription>
              </DialogHeader>

              {/* Method Selection */}
              <div className="space-y-4">
                <Label>Phương thức rút tiền</Label>
                <RadioGroup
                  value={withdrawMethod}
                  onValueChange={(value: "BANKING" | "CRYPTO") => setWithdrawMethod(value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${withdrawMethod === "BANKING" ? "border-blue-500 bg-blue-50" : ""}`}>
                    <RadioGroupItem value="BANKING" id="banking" />
                    <Label htmlFor="banking" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Ngân hàng</p>
                          <p className="text-xs text-gray-500">Chuyển khoản VND</p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${withdrawMethod === "CRYPTO" ? "border-green-500 bg-green-50" : ""}`}>
                    <RadioGroupItem value="CRYPTO" id="crypto" />
                    <Label htmlFor="crypto" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Bitcoin className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">Crypto</p>
                          <p className="text-xs text-gray-500">USDT TRC-20</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Banking Form */}
              {withdrawMethod === "BANKING" && (
                <form onSubmit={handleBankingSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Số tiền rút (VNĐ)</Label>
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
                      Số dư khả dụng: {formatVND(walletBalance)}
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
              )}

              {/* Crypto Form */}
              {withdrawMethod === "CRYPTO" && (
                <form onSubmit={handleCryptoSubmit} className="space-y-4">
                  {/* Exchange Rate Info */}
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-800">Tỷ giá USDT</span>
                      <span className="text-sm text-yellow-700">
                        1 USDT = {formatVND(usdtRate)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Số tiền rút (VNĐ)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={cryptoForm.amount}
                      onChange={(e) =>
                        setCryptoForm((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      max={walletBalance}
                      required
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Số dư khả dụng: {formatVND(walletBalance)}</span>
                    </div>
                  </div>

                  {/* USDT Preview */}
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bạn sẽ nhận được:</span>
                      <span className="text-xl font-bold text-green-600">
                        {usdtEquivalent} USDT
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Địa chỉ ví USDT (TRC-20)</Label>
                    <Input
                      placeholder="T..."
                      value={cryptoForm.walletAddress}
                      onChange={(e) =>
                        setCryptoForm((prev) => ({
                          ...prev,
                          walletAddress: e.target.value,
                        }))
                      }
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Chỉ hỗ trợ mạng TRON (TRC-20). Vui lòng kiểm tra kỹ địa chỉ ví.
                    </p>
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
              )}
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
                            {formatVND(parseFloat(tx.amount))}
                          </TableCell>
                          <TableCell>
                            {formatVND(parseFloat(tx.balanceAfter))}
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
                      Trang {page} / {Math.ceil((transactions.meta?.total || 0) / 10)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= Math.ceil((transactions.meta?.total || 0) / 10)}
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
                        <TableHead>Phương thức</TableHead>
                        <TableHead>Thông tin TK</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.data.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>
                            {new Date(withdrawal.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatVND(parseFloat(withdrawal.amount))}
                          </TableCell>
                          <TableCell>
                            {getMethodBadge(withdrawal.method)}
                          </TableCell>
                          <TableCell>
                            {withdrawal.method === "CRYPTO" ? (
                              <div className="text-xs">
                                <p className="font-medium">USDT TRC-20</p>
                                <p className="text-gray-500 truncate max-w-[150px]" title={withdrawal.account_info?.cryptoAddress}>
                                  {withdrawal.account_info?.cryptoAddress || "-"}
                                </p>
                              </div>
                            ) : (
                              <div className="text-xs">
                                <p className="font-medium">{withdrawal.account_info?.bankName || "-"}</p>
                                <p className="text-gray-500">{withdrawal.account_info?.accountNumber || "-"}</p>
                              </div>
                            )}
                          </TableCell>
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
                      {Math.ceil((withdrawals.meta?.total || 0) / 10)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setWithdrawalPage((p) => p + 1)}
                      disabled={
                        withdrawalPage >= Math.ceil((withdrawals.meta?.total || 0) / 10)
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
