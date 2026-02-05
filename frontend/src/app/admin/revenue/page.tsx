"use client";

import { useState } from "react";
import { useRevenueStatistics, useRevenueByUser } from "@/hooks/use-revenue";
import { formatVND } from "@/lib/utils";
import { RevenuePeriodData, RevenueByUserData } from "@/types/revenue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, FileText, Users, ChevronDown, ChevronRight } from "lucide-react";

type Period = "daily" | "weekly" | "monthly" | "yearly";

export default function AdminRevenuePage() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [byUserPage, setByUserPage] = useState(1);
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());

  const togglePeriod = (periodKey: string) => {
    setExpandedPeriods((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(periodKey)) {
        newSet.delete(periodKey);
      } else {
        newSet.add(periodKey);
      }
      return newSet;
    });
  };

  const { data: statsData, isLoading: statsLoading } = useRevenueStatistics(
    period,
    {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }
  );

  const { data: byUserData, isLoading: byUserLoading } = useRevenueByUser({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page: byUserPage,
    limit: 10,
  });

  const periodLabels: Record<Period, string> = {
    daily: "Theo ngày",
    weekly: "Theo tuần",
    monthly: "Theo tháng",
    yearly: "Theo năm",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Thống kê doanh thu</h1>
        <p className="text-gray-600">
          Xem thống kê doanh thu từ các hồ sơ giải ngân
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nhóm theo</Label>
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value as Period)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Theo ngày</SelectItem>
                  <SelectItem value="weekly">Theo tuần</SelectItem>
                  <SelectItem value="monthly">Theo tháng</SelectItem>
                  <SelectItem value="yearly">Theo năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {formatVND(Number(statsData?.totals?.revenue || 0))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giải ngân</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                {formatVND(Number(statsData?.totals?.disbursement || 0))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số hồ sơ</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">
                {statsData?.totals?.contractCount || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ TB</CardTitle>
            <Badge variant="outline">%</Badge>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {statsData?.totals?.averagePercentage || 0}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="by-period" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-period">Theo thời gian</TabsTrigger>
          <TabsTrigger value="by-user">Theo CTV</TabsTrigger>
        </TabsList>

        {/* By Period Tab */}
        <TabsContent value="by-period">
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu {periodLabels[period].toLowerCase()}</CardTitle>
              <CardDescription>
                {statsData?.dateFrom && statsData?.dateTo
                  ? `Từ ${new Date(statsData.dateFrom).toLocaleDateString("vi-VN")} đến ${new Date(statsData.dateTo).toLocaleDateString("vi-VN")}`
                  : "Đang tải..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-gray-100 rounded-lg font-medium text-sm text-gray-700">
                    <div>Thời gian</div>
                    <div className="text-right">Giải ngân</div>
                    <div className="text-right">Tỷ lệ TB</div>
                    <div className="text-right">Doanh thu</div>
                    <div className="text-right">Số hồ sơ</div>
                  </div>
                  
                  {/* Data Rows */}
                  {statsData?.data?.map((row: RevenuePeriodData) => {
                    const isExpanded = expandedPeriods.has(row.period);
                    return (
                      <div key={row.period} className="border rounded-lg">
                        {/* Main Row */}
                        <div
                          className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => togglePeriod(row.period)}
                        >
                          <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <div>
                                <div className="font-medium">{row.period}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(row.periodStart).toLocaleDateString("vi-VN")} -{" "}
                                  {new Date(row.periodEnd).toLocaleDateString("vi-VN")}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {formatVND(Number(row.disbursement))}
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{row.averagePercentage}%</Badge>
                            </div>
                            <div className="text-right text-green-600 font-medium">
                              {formatVND(Number(row.revenue))}
                            </div>
                            <div className="text-right">
                              <Badge>{row.contractCount}</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && row.contracts && row.contracts.length > 0 && (
                          <div className="px-4 pb-4 border-t bg-gray-50">
                            <div className="text-sm font-medium text-gray-700 mb-2 mt-2">
                              Chi tiết {row.contracts.length} hợp đồng:
                            </div>
                            <div className="bg-white rounded border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Số HĐ</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead>CTV</TableHead>
                                    <TableHead className="text-right">Giải ngân</TableHead>
                                    <TableHead className="text-right">Tỷ lệ</TableHead>
                                    <TableHead className="text-right">Doanh thu</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {row.contracts.map((contract) => (
                                    <TableRow key={contract.id}>
                                      <TableCell className="font-mono text-sm">
                                        {contract.contractNumber}
                                      </TableCell>
                                      <TableCell>
                                        <div className="text-sm">
                                          {new Date(contract.createdAt).toLocaleDateString("vi-VN")}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {new Date(contract.createdAt).toLocaleTimeString("vi-VN")}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {contract.creator ? (
                                          <div>
                                            <div className="text-sm">
                                              {contract.creator.fullname || "Chưa có tên"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {contract.creator.email}
                                            </div>
                                          </div>
                                        ) : (
                                          <span className="text-gray-400 text-sm">N/A</span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatVND(Number(contract.disbursement))}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {contract.revenuePercentage}%
                                      </TableCell>
                                      <TableCell className="text-right text-green-600 font-medium">
                                        {formatVND(Number(contract.revenue))}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(!statsData?.data || statsData.data.length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      Không có dữ liệu
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By User Tab */}
        <TabsContent value="by-user">
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo CTV</CardTitle>
              <CardDescription>
                Thống kê doanh thu từ các CTV tạo hồ sơ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {byUserLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>CTV</TableHead>
                        <TableHead className="text-right">Giải ngân</TableHead>
                        <TableHead className="text-right">Tỷ lệ TB</TableHead>
                        <TableHead className="text-right">Doanh thu</TableHead>
                        <TableHead className="text-right">Số hồ sơ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {byUserData?.data?.map((row: RevenueByUserData) => (
                        <TableRow key={row.user.id}>
                          <TableCell>
                            <div>
                              <span className="font-medium">
                                {row.user.fullname || "Chưa có tên"}
                              </span>
                              <div className="text-sm text-gray-500">{row.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatVND(Number(row.disbursement))}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.averagePercentage}%
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            {formatVND(Number(row.revenue))}
                          </TableCell>
                          <TableCell className="text-right">{row.contractCount}</TableCell>
                        </TableRow>
                      ))}
                      {(!byUserData?.data || byUserData.data.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500">
                            Không có dữ liệu
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {byUserData?.pagination && byUserData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Trang {byUserData.pagination.page} / {byUserData.pagination.totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={byUserPage === 1}
                          onClick={() => setByUserPage((p) => p - 1)}
                        >
                          Trước
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={byUserPage >= byUserData.pagination.totalPages}
                          onClick={() => setByUserPage((p) => p + 1)}
                        >
                          Sau
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
