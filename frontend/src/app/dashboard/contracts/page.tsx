"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useContracts } from "@/hooks/use-contracts";
import { useServices } from "@/hooks/use-services";
import { useAuthStore } from "@/store/auth-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Eye, User, Users } from "lucide-react";
import { StageBadge } from "@/components/ui/stage-badge";

export default function ContractsPage() {
  const { user } = useAuthStore();
  const isCTV = user?.roles?.some((r) => r.code === "CTV");

  // State for owned contracts
  const [ownedPage, setOwnedPage] = useState(1);
  const [ownedServiceFilter, setOwnedServiceFilter] = useState<string>("all");
  const [ownedStageFilter, setOwnedStageFilter] = useState<string>("all");

  // State for created contracts (CTV only)
  const [createdPage, setCreatedPage] = useState(1);
  const [createdServiceFilter, setCreatedServiceFilter] = useState<string>("all");
  const [createdStageFilter, setCreatedStageFilter] = useState<string>("all");

  // Active tab
  const [activeTab, setActiveTab] = useState<string>("owned");

  // Fetch services for filter
  const { data: services } = useServices({ activeOnly: true });

  // Fetch owned contracts
  const { data: ownedContracts, isLoading: ownedLoading } = useContracts({
    page: ownedPage,
    limit: 10,
    type: "owned",
    ...(ownedServiceFilter !== "all" && { serviceId: ownedServiceFilter }),
    ...(ownedStageFilter !== "all" && { stageCode: ownedStageFilter }),
  });

  // Fetch created contracts (for CTV)
  const { data: createdContracts, isLoading: createdLoading } = useContracts({
    page: createdPage,
    limit: 10,
    type: "created",
    ...(createdServiceFilter !== "all" && { serviceId: createdServiceFilter }),
    ...(createdStageFilter !== "all" && { stageCode: createdStageFilter }),
  });

  // Get stages for selected service (owned tab)
  const ownedStages = useMemo(() => {
    if (ownedServiceFilter === "all" || !services) return [];
    const service = services.find((s) => s.id === ownedServiceFilter);
    return service?.workflow?.stages?.sort((a, b) => a.stage_order - b.stage_order) || [];
  }, [ownedServiceFilter, services]);

  // Get stages for selected service (created tab)
  const createdStages = useMemo(() => {
    if (createdServiceFilter === "all" || !services) return [];
    const service = services.find((s) => s.id === createdServiceFilter);
    return service?.workflow?.stages?.sort((a, b) => a.stage_order - b.stage_order) || [];
  }, [createdServiceFilter, services]);

  // Reset stage filter when service changes
  useEffect(() => {
    setOwnedStageFilter("all");
  }, [ownedServiceFilter]);

  useEffect(() => {
    setCreatedStageFilter("all");
  }, [createdServiceFilter]);

  const renderContractsTable = (
    contracts: typeof ownedContracts,
    isLoading: boolean,
    page: number,
    setPage: (p: number) => void,
    showCustomer: boolean = false
  ) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (!contracts?.data || contracts.data.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-lg font-medium">Chưa có hồ sơ nào</p>
          <p className="text-sm mt-2">Bắt đầu bằng cách tạo hồ sơ mới</p>
          <Link href="/dashboard/contracts/new">
            <Button className="mt-4 bg-linear-to-r from-blue-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Tạo hồ sơ đầu tiên
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <>
        {/* Mobile card list */}
        <div className="sm:hidden space-y-2">
          {contracts.data.map((contract) => (
            <Link key={contract.id} href={`/dashboard/contracts/${contract.id}`} className="block">
              <div className="p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-semibold text-sm text-gray-900">
                    #{contract.contract_number || contract.id.slice(0, 8)}
                  </span>
                  <StageBadge stage={contract.stage} />
                </div>
                <p className="text-sm text-gray-600 truncate">{contract.service?.name || "Dịch vụ"}</p>
                {contract.requested_amount && (
                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(contract.requested_amount)}
                  </p>
                )}
                {showCustomer && contract.user && (
                  <p className="text-xs text-gray-400 mt-1">{contract.user.fullname} · {contract.user.phone}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{new Date(contract.created_at).toLocaleDateString("vi-VN")}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã hồ sơ</TableHead>
                {showCustomer && <TableHead>Khách hàng</TableHead>}
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Số tiền vay</TableHead>
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
                  {showCustomer && (
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{contract.user?.fullname || "N/A"}</span>
                        <span className="text-xs text-muted-foreground">{contract.user?.phone}</span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>{contract.service?.name || "Dịch vụ"}</TableCell>
                  <TableCell className="font-semibold text-blue-600">
                    {contract.requested_amount
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(contract.requested_amount)
                      : "—"}
                  </TableCell>
                  <TableCell>{new Date(contract.created_at).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell><StageBadge stage={contract.stage} /></TableCell>
                  <TableCell>
                    <Link href={`/dashboard/contracts/${contract.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" /> Chi tiết
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {Math.ceil((contracts.meta?.total || 0) / 10)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil((contracts.meta?.total || 0) / 10)}
          >
            Trang sau
          </Button>
        </div>
      </>
    );
  };

  const renderFilters = (
    serviceFilter: string,
    setServiceFilter: (v: string) => void,
    stageFilter: string,
    setStageFilter: (v: string) => void,
    stages: typeof ownedStages,
    setPage: (p: number) => void
  ) => (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
      <Select
        value={serviceFilter}
        onValueChange={(value) => {
          setServiceFilter(value);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-full sm:w-50">
          <SelectValue placeholder="Lọc theo dịch vụ" />
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

      <Select
        value={stageFilter}
        onValueChange={(value) => {
          setStageFilter(value);
          setPage(1);
        }}
        disabled={serviceFilter === "all"}
      >
        <SelectTrigger className="w-full sm:w-50">
          <SelectValue placeholder={serviceFilter === "all" ? "Chọn dịch vụ trước" : "Lọc theo trạng thái"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          {stages.map((stage) => (
            <SelectItem key={stage.code} value={stage.code || ""}>
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
  );

  // For non-CTV users, show simple view
  if (!isCTV) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Hồ sơ của tôi</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý các hồ sơ vay/dịch vụ của bạn</p>
          </div>
          <Link href="/dashboard/contracts/new" className="hidden sm:block">
            <Button className="bg-linear-to-r from-blue-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Tạo hồ sơ mới
            </Button>
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg">Danh sách hồ sơ</CardTitle>
                <CardDescription>Tất cả các hồ sơ đã nộp</CardDescription>
              </div>
              {renderFilters(
                ownedServiceFilter,
                setOwnedServiceFilter,
                ownedStageFilter,
                setOwnedStageFilter,
                ownedStages,
                setOwnedPage
              )}
            </div>
          </CardHeader>
          <CardContent>
            {renderContractsTable(ownedContracts, ownedLoading, ownedPage, setOwnedPage)}
          </CardContent>
        </Card>
      </div>
    );
  }

  // CTV view with tabs
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Quản lý hồ sơ</h1>
          <p className="text-sm text-gray-500 mt-0.5">Hồ sơ cá nhân và hồ sơ khách hàng của bạn</p>
        </div>
        <Link href="/dashboard/contracts/new" className="hidden sm:block">
          <Button className="bg-linear-to-r from-blue-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Tạo hồ sơ mới
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-full sm:max-w-md">
          <TabsTrigger value="owned" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Hồ sơ của tôi
            {ownedContracts?.meta?.total ? (
              <span className="ml-1 px-2 py-0.5 text-xs bg-primary/10 rounded-full">
                {ownedContracts.meta.total}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="created" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Hồ sơ khách hàng
            {createdContracts?.meta?.total ? (
              <span className="ml-1 px-2 py-0.5 text-xs bg-primary/10 rounded-full">
                {createdContracts.meta.total}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="owned">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg">Hồ sơ của tôi</CardTitle>
                  <CardDescription>Các hồ sơ do bạn tạo cho bản thân</CardDescription>
                </div>
                {renderFilters(
                  ownedServiceFilter,
                  setOwnedServiceFilter,
                  ownedStageFilter,
                  setOwnedStageFilter,
                  ownedStages,
                  setOwnedPage
                )}
              </div>
            </CardHeader>
            <CardContent>
              {renderContractsTable(ownedContracts, ownedLoading, ownedPage, setOwnedPage)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="created">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg">Hồ sơ khách hàng</CardTitle>
                  <CardDescription>Các hồ sơ bạn đã tạo dùm cho khách hàng</CardDescription>
                </div>
                {renderFilters(
                  createdServiceFilter,
                  setCreatedServiceFilter,
                  createdStageFilter,
                  setCreatedStageFilter,
                  createdStages,
                  setCreatedPage
                )}
              </div>
            </CardHeader>
            <CardContent>
              {renderContractsTable(createdContracts, createdLoading, createdPage, setCreatedPage, true)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
