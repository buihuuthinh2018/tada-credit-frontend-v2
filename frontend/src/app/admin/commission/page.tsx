"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Switch } from "@/components/ui/switch";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Award,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Play
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Types
interface CommissionConfig {
  id: string;
  role_code: string;
  rate: number;
  is_active: boolean;
  created_at: string;
}

interface KpiTier {
  id: string;
  name: string;
  role_code: string;
  min_contracts: number | null;
  min_disbursement: number | null;
  bonus_amount: number;
  tier_order: number;
  is_active: boolean;
}

interface Snapshot {
  id: string;
  user_id: string;
  period_month: number;
  period_year: number;
  total_contracts: number;
  total_disbursement: number;
  base_commission: number;
  bonus_commission: number;
  total_commission: number;
  status: string;
  user?: { id: string; fullname: string; email: string };
  kpi_tier?: { name: string };
}

// API functions
const fetchCommissionConfigs = async () => {
  const response = await apiClient.get("/admin/commission-configs");
  return response.data;
};

const fetchKpiTiers = async () => {
  const response = await apiClient.get("/admin/kpi-tiers");
  return response.data;
};

const fetchSnapshots = async (year?: number, month?: number) => {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());
  const response = await apiClient.get(`/admin/commission-snapshots?${params}`);
  return response.data;
};

const fetchSnapshotDay = async () => {
  const response = await apiClient.get("/admin/system-config/commission/snapshot-day");
  return response.data;
};

export default function AdminCommissionPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("configs");

  // Commission Config State
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<CommissionConfig | null>(null);
  const [configForm, setConfigForm] = useState({ roleCode: "", rate: 0.05 });

  // KPI Tier State
  const [isKpiDialogOpen, setIsKpiDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KpiTier | null>(null);
  const [kpiForm, setKpiForm] = useState({
    name: "",
    roleCode: "CTV",
    minContracts: 0,
    minDisbursement: 0,
    bonusAmount: 1000000,
    tierOrder: 1,
  });

  // Snapshot filter state
  const [snapshotYear, setSnapshotYear] = useState(new Date().getFullYear());
  const [snapshotMonth, setSnapshotMonth] = useState<number | undefined>();

  // Queries
  const { data: configsData, isLoading: configsLoading } = useQuery({
    queryKey: ["commission-configs"],
    queryFn: fetchCommissionConfigs,
  });

  const { data: kpiTiersData, isLoading: kpiLoading } = useQuery({
    queryKey: ["kpi-tiers"],
    queryFn: fetchKpiTiers,
  });

  const { data: snapshotsData, isLoading: snapshotsLoading } = useQuery({
    queryKey: ["snapshots", snapshotYear, snapshotMonth],
    queryFn: () => fetchSnapshots(snapshotYear, snapshotMonth),
  });

  const { data: snapshotDayData } = useQuery({
    queryKey: ["snapshot-day"],
    queryFn: fetchSnapshotDay,
  });

  // Mutations
  const createConfigMutation = useMutation({
    mutationFn: (data: { roleCode: string; rate: number }) =>
      apiClient.post("/admin/commission-configs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-configs"] });
      setIsConfigDialogOpen(false);
      setConfigForm({ roleCode: "", rate: 0.05 });
      toast.success("Tạo cấu hình hoa hồng thành công");
    },
    onError: () => {
      toast.error("Không thể tạo cấu hình");
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: (data: { id: string; rate?: number; isActive?: boolean }) =>
      apiClient.put(`/admin/commission-configs/${data.id}`, {
        rate: data.rate,
        isActive: data.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-configs"] });
      setEditingConfig(null);
      toast.success("Cập nhật cấu hình thành công");
    },
  });

  const createKpiMutation = useMutation({
    mutationFn: (data: typeof kpiForm) =>
      apiClient.post("/admin/kpi-tiers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-tiers"] });
      setIsKpiDialogOpen(false);
      setKpiForm({
        name: "",
        roleCode: "CTV",
        minContracts: 0,
        minDisbursement: 0,
        bonusAmount: 1000000,
        tierOrder: 1,
      });
      toast.success("Tạo KPI tier thành công");
    },
    onError: () => {
      toast.error("Không thể tạo KPI tier");
    },
  });

  const updateKpiMutation = useMutation({
    mutationFn: (data: { id: string } & Partial<typeof kpiForm>) =>
      apiClient.put(`/admin/kpi-tiers/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-tiers"] });
      setEditingKpi(null);
      toast.success("Cập nhật KPI tier thành công");
    },
  });

  const deleteKpiMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/kpi-tiers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-tiers"] });
      toast.success("Xóa KPI tier thành công");
    },
    onError: () => {
      toast.error("Không thể xóa KPI tier");
    },
  });

  const processSnapshotMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/commission-snapshots/${id}/process`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snapshots"] });
      toast.success("Xử lý thưởng KPI thành công");
    },
    onError: () => {
      toast.error("Không thể xử lý snapshot");
    },
  });

  const runSnapshotMutation = useMutation({
    mutationFn: (data: { year: number; month: number }) =>
      apiClient.post(`/admin/scheduler/run-monthly-snapshot?year=${data.year}&month=${data.month}`),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["snapshots"] });
      toast.success(`Đã tạo ${response.data.successCount} snapshot thành công`);
    },
    onError: () => {
      toast.error("Không thể chạy snapshot");
    },
  });

  const updateSnapshotDayMutation = useMutation({
    mutationFn: (day: number) =>
      apiClient.put("/admin/system-config/commission/snapshot-day", { day }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snapshot-day"] });
      toast.success("Cập nhật ngày snapshot thành công");
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Quản lý Hoa hồng & KPI</h1>
          <p className="text-gray-600">
            Cấu hình tỷ lệ hoa hồng, KPI và quản lý snapshot hàng tháng
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex overflow-x-auto">
          <TabsTrigger value="configs" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Settings className="w-4 h-4 hidden sm:block" />
            Cấu hình
          </TabsTrigger>
          <TabsTrigger value="kpi" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Award className="w-4 h-4 hidden sm:block" />
            KPI
          </TabsTrigger>
          <TabsTrigger value="snapshots" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <FileText className="w-4 h-4 hidden sm:block" />
            Snapshots
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Calendar className="w-4 h-4 hidden sm:block" />
            Cài đặt
          </TabsTrigger>
        </TabsList>

        {/* Commission Configs Tab */}
        <TabsContent value="configs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Cấu hình tỷ lệ hoa hồng</CardTitle>
                <CardDescription>
                  Tỷ lệ hoa hồng cơ bản theo vai trò người dùng
                </CardDescription>
              </div>
              <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm cấu hình
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm cấu hình hoa hồng</DialogTitle>
                    <DialogDescription>
                      Tạo tỷ lệ hoa hồng mới cho một vai trò
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Vai trò</Label>
                      <Select
                        value={configForm.roleCode}
                        onValueChange={(v) =>
                          setConfigForm({ ...configForm, roleCode: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CTV">Cộng tác viên (CTV)</SelectItem>
                          <SelectItem value="USER">Người dùng (USER)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tỷ lệ hoa hồng (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={configForm.rate * 100}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            rate: parseFloat(e.target.value) / 100,
                          })
                        }
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Ví dụ: 5% = 0.05
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsConfigDialogOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={() => createConfigMutation.mutate(configForm)}
                      disabled={!configForm.roleCode || createConfigMutation.isPending}
                    >
                      {createConfigMutation.isPending ? "Đang tạo..." : "Tạo"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {configsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Tỷ lệ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configsData?.data?.map((config: CommissionConfig) => (
                      <TableRow key={config.id}>
                        <TableCell>
                          <Badge variant={config.role_code === "CTV" ? "default" : "secondary"}>
                            {config.role_code}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPercent(config.rate)}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={config.is_active}
                            onCheckedChange={(checked: boolean) =>
                              updateConfigMutation.mutate({
                                id: config.id,
                                isActive: checked,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(config.created_at).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingConfig(config)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPI Tiers Tab */}
        <TabsContent value="kpi" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>KPI Tiers</CardTitle>
                <CardDescription>
                  Các mức KPI để tính thưởng thêm cho cộng tác viên
                </CardDescription>
              </div>
              <Dialog open={isKpiDialogOpen} onOpenChange={setIsKpiDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm KPI Tier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm KPI Tier</DialogTitle>
                    <DialogDescription>
                      Tạo mức KPI mới với điều kiện và thưởng
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Tên tier</Label>
                      <Input
                        value={kpiForm.name}
                        onChange={(e) =>
                          setKpiForm({ ...kpiForm, name: e.target.value })
                        }
                        placeholder="VD: Gold, Silver, Bronze"
                      />
                    </div>
                    <div>
                      <Label>Vai trò</Label>
                      <Select
                        value={kpiForm.roleCode}
                        onValueChange={(v) =>
                          setKpiForm({ ...kpiForm, roleCode: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CTV">CTV</SelectItem>
                          <SelectItem value="USER">USER</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Số hợp đồng tối thiểu</Label>
                        <Input
                          type="number"
                          min="0"
                          value={kpiForm.minContracts}
                          onChange={(e) =>
                            setKpiForm({
                              ...kpiForm,
                              minContracts: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Giải ngân tối thiểu (VND)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={kpiForm.minDisbursement}
                          onChange={(e) =>
                            setKpiForm({
                              ...kpiForm,
                              minDisbursement: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Số tiền thưởng (VND)</Label>
                        <Input
                          type="number"
                          step="100000"
                          min="0"
                          value={kpiForm.bonusAmount}
                          onChange={(e) =>
                            setKpiForm({
                              ...kpiForm,
                              bonusAmount: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          VD: 1,000,000 = 1 triệu VND
                        </p>
                      </div>
                      <div>
                        <Label>Thứ tự tier</Label>
                        <Input
                          type="number"
                          min="1"
                          value={kpiForm.tierOrder}
                          onChange={(e) =>
                            setKpiForm({
                              ...kpiForm,
                              tierOrder: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Số lớn hơn = tier cao hơn
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsKpiDialogOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={() => createKpiMutation.mutate(kpiForm)}
                      disabled={!kpiForm.name || createKpiMutation.isPending}
                    >
                      {createKpiMutation.isPending ? "Đang tạo..." : "Tạo"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {kpiLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Số HĐ tối thiểu</TableHead>
                      <TableHead>Giải ngân tối thiểu</TableHead>
                      <TableHead>Thưởng</TableHead>
                      <TableHead>Thứ tự</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpiTiersData?.data?.map((tier: KpiTier) => (
                      <TableRow key={tier.id}>
                        <TableCell className="font-medium">{tier.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tier.role_code}</Badge>
                        </TableCell>
                        <TableCell>{tier.min_contracts || "-"}</TableCell>
                        <TableCell>
                          {tier.min_disbursement
                            ? formatCurrency(tier.min_disbursement)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          +{formatCurrency(tier.bonus_amount || 0)}
                        </TableCell>
                        <TableCell>{tier.tier_order}</TableCell>
                        <TableCell>
                          <Badge
                            variant={tier.is_active ? "default" : "secondary"}
                          >
                            {tier.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingKpi(tier);
                              setKpiForm({
                                name: tier.name,
                                roleCode: tier.role_code,
                                minContracts: tier.min_contracts || 0,
                                minDisbursement: tier.min_disbursement || 0,
                                bonusAmount: tier.bonus_amount || 0,
                                tierOrder: tier.tier_order,
                              });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc muốn xóa KPI tier "{tier.name}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteKpiMutation.mutate(tier.id)}
                                >
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Snapshots Tab */}
        <TabsContent value="snapshots" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Commission Snapshots</CardTitle>
                <CardDescription>
                  Tổng kết hoa hồng và KPI hàng tháng
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Label>Năm:</Label>
                  <Select
                    value={snapshotYear.toString()}
                    onValueChange={(v) => setSnapshotYear(parseInt(v))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Tháng:</Label>
                  <Select
                    value={snapshotMonth?.toString() || "all"}
                    onValueChange={(v) =>
                      setSnapshotMonth(v === "all" ? undefined : parseInt(v))
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {[...Array(12)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Tháng {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    runSnapshotMutation.mutate({
                      year: snapshotYear,
                      month: snapshotMonth || new Date().getMonth() + 1,
                    })
                  }
                  disabled={runSnapshotMutation.isPending}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Chạy Snapshot
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {snapshotsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Tháng/Năm</TableHead>
                      <TableHead>Số HĐ</TableHead>
                      <TableHead>Giải ngân</TableHead>
                      <TableHead>Hoa hồng cơ bản</TableHead>
                      <TableHead>KPI Tier</TableHead>
                      <TableHead>Thưởng KPI</TableHead>
                      <TableHead>Tổng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshotsData?.data?.map((snapshot: Snapshot) => (
                      <TableRow key={snapshot.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{snapshot.user?.fullname}</p>
                            <p className="text-sm text-gray-500">
                              {snapshot.user?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {snapshot.period_month}/{snapshot.period_year}
                        </TableCell>
                        <TableCell>{snapshot.total_contracts}</TableCell>
                        <TableCell>
                          {formatCurrency(snapshot.total_disbursement)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(snapshot.base_commission)}
                        </TableCell>
                        <TableCell>
                          {snapshot.kpi_tier ? (
                            <Badge variant="outline">{snapshot.kpi_tier.name}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-green-600">
                          +{formatCurrency(snapshot.bonus_commission)}
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(snapshot.total_commission)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              snapshot.status === "PROCESSED"
                                ? "default"
                                : snapshot.status === "PENDING"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {snapshot.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {snapshot.status === "PENDING" &&
                            snapshot.bonus_commission > 0 && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  processSnapshotMutation.mutate(snapshot.id)
                                }
                                disabled={processSnapshotMutation.isPending}
                              >
                                Xử lý thưởng
                              </Button>
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt Snapshot</CardTitle>
              <CardDescription>
                Cấu hình ngày chạy snapshot hoa hồng hàng tháng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Ngày snapshot trong tháng</p>
                  <p className="text-sm text-gray-500">
                    Hệ thống sẽ tự động chạy snapshot vào ngày này hàng tháng
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={(snapshotDayData?.day || 1).toString()}
                    onValueChange={(v) =>
                      updateSnapshotDayMutation.mutate(parseInt(v))
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(28)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Ngày {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  📋 Hướng dẫn
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Snapshot sẽ tổng kết hoa hồng của tháng <strong>trước đó</strong>
                  </li>
                  <li>
                    • Ví dụ: Chạy ngày 1/02 sẽ tổng kết tháng 01
                  </li>
                  <li>
                    • Thưởng KPI sẽ được cộng vào ví sau khi admin xử lý
                  </li>
                  <li>
                    • Nên chọn ngày từ 1-28 để tránh vấn đề với tháng ngắn
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Config Dialog */}
      <Dialog open={!!editingConfig} onOpenChange={() => setEditingConfig(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa cấu hình hoa hồng</DialogTitle>
          </DialogHeader>
          {editingConfig && (
            <div className="space-y-4">
              <div>
                <Label>Vai trò</Label>
                <Input value={editingConfig.role_code} disabled />
              </div>
              <div>
                <Label>Tỷ lệ hoa hồng (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={editingConfig.rate * 100}
                  onChange={(e) =>
                    setEditingConfig({
                      ...editingConfig,
                      rate: parseFloat(e.target.value) / 100,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingConfig(null)}>
              Hủy
            </Button>
            <Button
              onClick={() =>
                editingConfig &&
                updateConfigMutation.mutate({
                  id: editingConfig.id,
                  rate: editingConfig.rate,
                })
              }
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit KPI Dialog */}
      <Dialog open={!!editingKpi} onOpenChange={() => setEditingKpi(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa KPI Tier</DialogTitle>
          </DialogHeader>
          {editingKpi && (
            <div className="space-y-4">
              <div>
                <Label>Tên tier</Label>
                <Input
                  value={kpiForm.name}
                  onChange={(e) =>
                    setKpiForm({ ...kpiForm, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số HĐ tối thiểu</Label>
                  <Input
                    type="number"
                    value={kpiForm.minContracts}
                    onChange={(e) =>
                      setKpiForm({
                        ...kpiForm,
                        minContracts: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Giải ngân tối thiểu</Label>
                  <Input
                    type="number"
                    value={kpiForm.minDisbursement}
                    onChange={(e) =>
                      setKpiForm({
                        ...kpiForm,
                        minDisbursement: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số tiền thưởng (VND)</Label>
                  <Input
                    type="number"
                    step="100000"
                    min="0"
                    value={kpiForm.bonusAmount}
                    onChange={(e) =>
                      setKpiForm({
                        ...kpiForm,
                        bonusAmount: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    VD: 1,000,000 = 1 triệu VND
                  </p>
                </div>
                <div>
                  <Label>Thứ tự tier</Label>
                  <Input
                    type="number"
                    value={kpiForm.tierOrder}
                    onChange={(e) =>
                      setKpiForm({
                        ...kpiForm,
                        tierOrder: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingKpi(null)}>
              Hủy
            </Button>
            <Button
              onClick={() =>
                editingKpi &&
                updateKpiMutation.mutate({
                  id: editingKpi.id,
                  ...kpiForm,
                })
              }
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
