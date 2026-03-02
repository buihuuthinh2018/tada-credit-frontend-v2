"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useAdminContracts,
} from "@/hooks/use-contracts";
import { useServices } from "@/hooks/use-services";
import { useWorkflows, useWorkflow } from "@/hooks/use-workflows";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { FileText, Eye, Search, X, Filter } from "lucide-react";
import Link from "next/link";
import { StageBadge } from "@/components/ui/stage-badge";

export default function AdminContractsPage() {
  const [page, setPage] = useState(1);
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get services for filter dropdown
  const { data: services } = useServices();

  // Get selected service to find its workflow
  const selectedService = useMemo(() => {
    if (serviceFilter === "all" || !services) return null;
    return services.find(s => s.id === serviceFilter);
  }, [serviceFilter, services]);

  // Get workflow for selected service to get stages
  const { data: workflow } = useWorkflow(selectedService?.workflow_id || "");

  // Stages for the selected service's workflow
  const availableStages = useMemo(() => {
    if (!workflow?.stages) return [];
    return workflow.stages.sort((a, b) => a.stage_order - b.stage_order);
  }, [workflow?.stages]);

  // Reset stage filter when service changes
  useEffect(() => {
    setStageFilter("all");
    setPage(1);
  }, [serviceFilter]);

  const { data: contracts, isLoading } = useAdminContracts({
    page,
    limit: 10,
    ...(serviceFilter !== "all" && { serviceId: serviceFilter }),
    ...(stageFilter !== "all" && { stageId: stageFilter }),
    ...(debouncedSearch && { search: debouncedSearch }),
  });

  const clearFilters = () => {
    setServiceFilter("all");
    setStageFilter("all");
    setSearchQuery("");
    setDebouncedSearch("");
    setPage(1);
  };

  const hasActiveFilters = serviceFilter !== "all" || stageFilter !== "all" || searchQuery !== "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Quản lý Hồ sơ</h1>
        <p className="text-gray-600">Xem và duyệt các hồ sơ vay</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách Hồ sơ</CardTitle>
                <CardDescription>
                  Tổng cộng {contracts?.meta?.total || 0} hồ sơ
                </CardDescription>
              </div>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search Input */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm theo mã hồ sơ, email, SĐT, họ tên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Service Filter */}
              <Select
                value={serviceFilter}
                onValueChange={(value) => {
                  setServiceFilter(value);
                }}
              >
                <SelectTrigger className="w-full sm:w-50">
                  <Filter className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Loại dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                  {services?.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Stage Filter - Only show when service is selected */}
              <Select
                value={stageFilter}
                onValueChange={(value) => {
                  setStageFilter(value);
                  setPage(1);
                }}
                disabled={serviceFilter === "all"}
              >
                <SelectTrigger className="w-full sm:w-50">
                  <SelectValue placeholder={serviceFilter === "all" ? "Chọn dịch vụ trước" : "Trạng thái"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {availableStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color || "#6B7280" }}
                        />
                        {stage.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          ) : contracts?.data && contracts.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã hồ sơ</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.data.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium font-mono">
                        {contract.contract_number || `#${contract.id.slice(0, 8)}`}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{contract.user?.fullname || "N/A"}</div>
                          <div className="text-sm text-gray-500">
                            {contract.user?.email}
                          </div>
                          {contract.user?.phone && (
                            <div className="text-sm text-gray-500">
                              {contract.user?.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{contract.service?.name}</TableCell>
                      <TableCell>
                        {new Date(contract.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <StageBadge stage={contract.stage} />
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
                  Trang {page} / {contracts.meta?.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!contracts.meta?.hasNextPage}
                >
                  Trang sau
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Không có hồ sơ nào</p>
              {hasActiveFilters && (
                <p className="text-sm mt-2">
                  Thử xóa bộ lọc để xem tất cả hồ sơ
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
