"use client";

import { useState } from "react";
import { useServices, useCreateService, useUpdateService } from "@/hooks/use-services";
import { useWorkflows } from "@/hooks/use-workflows";
import { useDocumentRequirements } from "@/hooks/use-documents";
import { useQuestions } from "@/hooks/use-questions";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileBox, Plus, Edit, Eye } from "lucide-react";
import { Service } from "@/types";

export default function AdminServicesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    workflowId: "",
    minLoanAmount: 1000000,
    maxLoanAmount: 100000000,
    documentRequirements: [] as Array<{ id: string; isRequired: boolean }>,
    questionIds: [] as string[],
  });

  const [docSearch, setDocSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    min_loan_amount: 1000000,
    max_loan_amount: 100000000,
  });

  const { data: services, isLoading } = useServices();
  const { data: workflows, isLoading: isLoadingWorkflows } = useWorkflows();
  const { data: documentRequirements, isLoading: isLoadingDocs } = useDocumentRequirements();
  const { data: questions, isLoading: isLoadingQuestions } = useQuestions({ activeOnly: true, limit: 1000, page: 1 });
  const createService = useCreateService();
  const updateService = useUpdateService();

  const resetCreateForm = () => {
    setCreateFormData({
      name: "",
      description: "",
      workflowId: "",
      minLoanAmount: 1000000,
      maxLoanAmount: 100000000,
      documentRequirements: [],
      questionIds: [],
    });
    setDocSearch("");
    setQuestionSearch("");
  };

  const handleCreate = () => {
    if (!createFormData.name || !createFormData.workflowId) return;
    createService.mutate(createFormData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        resetCreateForm();
      },
    });
  };

  const isDocSelected = (id: string) =>
    createFormData.documentRequirements.some((d) => d.id === id);

  const getDocIsRequired = (id: string) =>
    createFormData.documentRequirements.find((d) => d.id === id)?.isRequired ?? true;

  const toggleDocSelected = (id: string) => {
    setCreateFormData((prev) => {
      const exists = prev.documentRequirements.some((d) => d.id === id);
      if (exists) {
        return {
          ...prev,
          documentRequirements: prev.documentRequirements.filter((d) => d.id !== id),
        };
      }
      return {
        ...prev,
        documentRequirements: [...prev.documentRequirements, { id, isRequired: true }],
      };
    });
  };

  const setDocRequired = (id: string, isRequired: boolean) => {
    setCreateFormData((prev) => ({
      ...prev,
      documentRequirements: prev.documentRequirements.map((d) =>
        d.id === id ? { ...d, isRequired } : d
      ),
    }));
  };

  const toggleSelectedId = (current: string[], id: string) => {
    if (current.includes(id)) return current.filter((x) => x !== id);
    return [...current, id];
  };

  const handleUpdate = () => {
    if (!editingService) return;
    updateService.mutate(
      { id: editingService.id, data: editFormData },
      {
        onSuccess: () => {
          setEditingService(null);
          setEditFormData({ name: "", description: "", min_loan_amount: 1000000, max_loan_amount: 100000000 });
        },
      }
    );
  };

  const toggleServiceStatus = (service: Service) => {
    updateService.mutate({
      id: service.id,
      data: { is_active: !service.is_active },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Dịch vụ</h1>
          <p className="text-gray-600">Cấu hình các dịch vụ trong hệ thống</p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetCreateForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo dịch vụ mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo dịch vụ mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin để tạo dịch vụ mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Workflow *</Label>
                <Select
                  value={createFormData.workflowId}
                  onValueChange={(v) =>
                    setCreateFormData((prev) => ({ ...prev, workflowId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingWorkflows
                          ? "Đang tải workflow..."
                          : "Chọn workflow"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(workflows || [])
                      .filter((w) => w.is_active && (w._count?.stages ?? 0) > 0)
                      .map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                          {typeof w.version === "number" ? ` (v${w.version})` : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {!isLoadingWorkflows &&
                  (workflows || []).filter(
                    (w) => w.is_active && (w._count?.stages ?? 0) > 0
                  ).length === 0 && (
                  <p className="text-xs text-amber-600">
                    Chưa có workflow hoạt động và đã cấu hình stage. Hãy tạo/cấu hình workflow trước khi tạo dịch vụ.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Tên dịch vụ</Label>
                <Input
                  value={createFormData.name}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="VD: Vay tín chấp"
                />
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Mô tả chi tiết về dịch vụ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giới hạn vay tối thiểu (VND)</Label>
                  <Input
                    type="text"
                    value={formatVND(createFormData.minLoanAmount, false)}
                    onChange={(e) => {
                      const numValue = parseInt(e.target.value.replace(/[^\d]/g, '')) || 0;
                      setCreateFormData((prev) => ({
                        ...prev,
                        minLoanAmount: numValue,
                      }));
                    }}
                    placeholder="1.000.000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giới hạn vay tối đa (VND)</Label>
                  <Input
                    type="text"
                    value={formatVND(createFormData.maxLoanAmount, false)}
                    onChange={(e) => {
                      const numValue = parseInt(e.target.value.replace(/[^\d]/g, '')) || 0;
                      setCreateFormData((prev) => ({
                        ...prev,
                        maxLoanAmount: numValue,
                      }));
                    }}
                    placeholder="100.000.000"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Khách hàng phải nhập nhu cầu vay trong khoảng này khi tạo hồ sơ.
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Tài liệu cần thiết</Label>
                  <span className="text-xs text-muted-foreground">
                    Đã chọn: {createFormData.documentRequirements.length}
                  </span>
                </div>
                <Input
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder={isLoadingDocs ? "Đang tải tài liệu..." : "Tìm theo tên / mã"}
                />
                <div className="max-h-44 overflow-auto rounded-md border p-2">
                  {isLoadingDocs ? (
                    <p className="text-sm text-muted-foreground">Đang tải...</p>
                  ) : (documentRequirements || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có tài liệu nào.</p>
                  ) : (
                    (documentRequirements || [])
                      .filter((d) => d.is_active)
                      .filter((d) => {
                        const term = docSearch.trim().toLowerCase();
                        if (!term) return true;
                        return (
                          d.name.toLowerCase().includes(term) ||
                          d.code.toLowerCase().includes(term)
                        );
                      })
                      .map((d) => {
                        const checked = isDocSelected(d.id);
                        const requiredValue = getDocIsRequired(d.id) ? "required" : "optional";
                        return (
                          <label
                            key={d.id}
                            className="flex items-start justify-between gap-3 rounded px-2 py-1 hover:bg-muted"
                          >
                            <div className="flex min-w-0 flex-1 items-start gap-2">
                              <Checkbox checked={checked} onCheckedChange={() => toggleDocSelected(d.id)} />
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium">{d.name}</div>
                                <div className="truncate text-xs text-muted-foreground">
                                  {d.code} • v{d.version}
                                </div>
                              </div>
                            </div>

                            {checked ? (
                              <Select
                                value={requiredValue}
                                onValueChange={(v) => setDocRequired(d.id, v === "required")}
                              >
                                <SelectTrigger className="h-8 w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="required">Bắt buộc</SelectItem>
                                  <SelectItem value="optional">Tùy chọn</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="h-8 w-32" />
                            )}
                          </label>
                        );
                      })
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Với mỗi dịch vụ, bạn có thể chọn tài liệu Bắt buộc hoặc Tùy chọn.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Câu hỏi cần thiết</Label>
                  <span className="text-xs text-muted-foreground">
                    Đã chọn: {createFormData.questionIds.length}
                  </span>
                </div>
                <Input
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  placeholder={
                    isLoadingQuestions ? "Đang tải câu hỏi..." : "Tìm theo nội dung"
                  }
                />
                <div className="max-h-44 overflow-auto rounded-md border p-2">
                  {isLoadingQuestions ? (
                    <p className="text-sm text-muted-foreground">Đang tải...</p>
                  ) : (questions || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có câu hỏi nào.</p>
                  ) : (
                    (questions || [])
                      .filter((q) => q.is_active)
                      .filter((q) => {
                        const term = questionSearch.trim().toLowerCase();
                        if (!term) return true;
                        return q.content.toLowerCase().includes(term);
                      })
                      .map((q) => {
                        const checked = createFormData.questionIds.includes(q.id);
                        return (
                          <label
                            key={q.id}
                            className="flex cursor-pointer items-start gap-2 rounded px-2 py-1 hover:bg-muted"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() =>
                                setCreateFormData((prev) => ({
                                  ...prev,
                                  questionIds: toggleSelectedId(prev.questionIds, q.id),
                                }))
                              }
                            />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">{q.content}</div>
                              <div className="truncate text-xs text-muted-foreground">
                                {q.type}
                              </div>
                            </div>
                          </label>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  createService.isPending ||
                  !createFormData.name ||
                  !createFormData.workflowId
                }
              >
                {createService.isPending ? "Đang tạo..." : "Tạo dịch vụ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách dịch vụ</CardTitle>
          <CardDescription>
            Tất cả các dịch vụ được cấu hình trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : services && services.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên dịch vụ</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">#{service.id}</TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {service.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={service.is_active ? "success" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleServiceStatus(service)}
                      >
                        {service.is_active ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(service.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.location.href = `/admin/services/${service.id}`;
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingService(service);
                            setEditFormData({
                              name: service.name,
                              description: service.description,
                              min_loan_amount: Number(service.min_loan_amount) || 1000000,
                              max_loan_amount: Number(service.max_loan_amount) || 100000000,
                            });
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileBox className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chưa có dịch vụ nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingService}
        onOpenChange={(open) => {
          if (!open) {
            setEditingService(null);
            setEditFormData({ name: "", description: "", min_loan_amount: 1000000, max_loan_amount: 100000000 });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
            <DialogDescription>Cập nhật thông tin dịch vụ</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên dịch vụ</Label>
              <Input
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giới hạn vay tối thiểu (VND)</Label>
                <Input
                  type="text"
                  value={formatVND(editFormData.min_loan_amount, false)}
                  onChange={(e) => {
                    const numValue = parseInt(e.target.value.replace(/[^\d]/g, '')) || 0;
                    setEditFormData((prev) => ({
                      ...prev,
                      min_loan_amount: numValue,
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Giới hạn vay tối đa (VND)</Label>
                <Input
                  type="text"
                  value={formatVND(editFormData.max_loan_amount, false)}
                  onChange={(e) => {
                    const numValue = parseInt(e.target.value.replace(/[^\d]/g, '')) || 0;
                    setEditFormData((prev) => ({
                      ...prev,
                      max_loan_amount: numValue,
                    }));
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingService(null);
                setEditFormData({ name: "", description: "", min_loan_amount: 1000000, max_loan_amount: 100000000 });
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={updateService.isPending}>
              {updateService.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
