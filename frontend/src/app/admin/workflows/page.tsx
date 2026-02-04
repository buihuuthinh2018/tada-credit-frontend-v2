"use client";

import { useEffect, useState } from "react";
import {
  useWorkflows,
  useCreateWorkflow,
  useUpdateWorkflow,
} from "@/hooks/use-workflows";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { GitBranch, Plus, Edit, Eye, Trash2, ArrowRight, DollarSign } from "lucide-react";
import { Workflow, CreateWorkflowStageRequest, CreateWorkflowTransitionRequest } from "@/types";
import Link from "next/link";
import { STAGE_COLOR_OPTIONS } from "@/lib/stage-utils";
import { StageBadge } from "@/components/ui/stage-badge";
import { Checkbox } from "@/components/ui/checkbox";

interface WorkflowFormData {
  name: string;
  description: string;
  stages: CreateWorkflowStageRequest[];
  transitions: CreateWorkflowTransitionRequest[];
}

const DEFAULT_STAGES: CreateWorkflowStageRequest[] = [
  { code: "DRAFT", name: "Nháp", stageOrder: 0, color: "#6B7280", isRequired: true },
  { code: "SUBMITTED", name: "Đã gửi", stageOrder: 1, color: "#F59E0B", isRequired: true },
  { code: "REVIEWING", name: "Đang xem xét", stageOrder: 2, color: "#3B82F6" },
  { code: "APPROVED", name: "Đã duyệt", stageOrder: 3, color: "#10B981" },
  { code: "REJECTED", name: "Từ chối", stageOrder: 4, color: "#EF4444" },
  { code: "COMPLETED", name: "Hoàn thành", stageOrder: 5, color: "#8B5CF6", isRequired: true, triggersCommission: true },
];

const DEFAULT_TRANSITIONS: CreateWorkflowTransitionRequest[] = [
  { fromStageCode: "DRAFT", toStageCode: "SUBMITTED", requiredPermission: "contract:submit" },
  { fromStageCode: "SUBMITTED", toStageCode: "REVIEWING", requiredPermission: "contract:review" },
  { fromStageCode: "REVIEWING", toStageCode: "APPROVED", requiredPermission: "contract:approve" },
  { fromStageCode: "REVIEWING", toStageCode: "REJECTED", requiredPermission: "contract:reject" },
  { fromStageCode: "APPROVED", toStageCode: "COMPLETED", requiredPermission: "contract:complete" },
];

export default function AdminWorkflowsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: "",
    description: "",
    stages: [],
    transitions: [],
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
  });

  // New stage form
  const [newStage, setNewStage] = useState<CreateWorkflowStageRequest>({
    code: "",
    name: "",
    stageOrder: 0,
    color: "#6B7280",
    triggersCommission: false,
  });

  // New transition form
  const [newTransition, setNewTransition] = useState<CreateWorkflowTransitionRequest>({
    fromStageCode: "",
    toStageCode: "",
    requiredPermission: "",
  });

  const { data: workflows, isLoading } = useWorkflows();
  const createWorkflow = useCreateWorkflow();
  const updateWorkflow = useUpdateWorkflow();

  useEffect(() => {
    console.log("Workflows data:", workflows);
  }, [workflows]);

  const resetCreateForm = () => {
    // Initialize with required stages
    const requiredStages: CreateWorkflowStageRequest[] = [
      { code: "DRAFT", name: "Nháp", stageOrder: 0, color: "#6B7280", isRequired: true },
      { code: "SUBMITTED", name: "Đã gửi", stageOrder: 1, color: "#F59E0B", isRequired: true },
      { code: "COMPLETED", name: "Hoàn thành", stageOrder: 2, color: "#8B5CF6", isRequired: true, triggersCommission: true },
    ];
    
    setFormData({
      name: "",
      description: "",
      stages: requiredStages,
      transitions: [],
    });
    setActiveTab("basic");
    setNewStage({ code: "", name: "", stageOrder: 0, color: "#6B7280", triggersCommission: false });
    setNewTransition({ fromStageCode: "", toStageCode: "", requiredPermission: "" });
  };

  const loadDefaultTemplate = () => {
    setFormData((prev) => ({
      ...prev,
      stages: [...DEFAULT_STAGES],
      transitions: [...DEFAULT_TRANSITIONS],
    }));
  };

  const handleCreate = () => {
    createWorkflow.mutate(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        resetCreateForm();
      },
    });
  };

  const handleUpdate = () => {
    if (!editingWorkflow) return;
    updateWorkflow.mutate(
      { id: editingWorkflow.id, data: editFormData },
      {
        onSuccess: () => {
          setEditingWorkflow(null);
          setEditFormData({ name: "", description: "" });
        },
      }
    );
  };

  const toggleWorkflowStatus = (workflow: Workflow) => {
    updateWorkflow.mutate({
      id: workflow.id,
      data: { is_active: !workflow.is_active },
    });
  };

  const addStage = () => {
    if (!newStage.code || !newStage.name) return;
    
    setFormData((prev) => {
      // Check if stage code already exists
      const exists = prev.stages.some(s => s.code === newStage.code);
      if (exists) {
        return prev; // Don't add duplicate
      }
      
      // If new stage has triggersCommission, remove it from all existing stages
      let updatedStages = prev.stages;
      if (newStage.triggersCommission) {
        updatedStages = prev.stages.map(s => ({ ...s, triggersCommission: false }));
      }
      
      // Find COMPLETED stage index
      const completedIndex = updatedStages.findIndex(s => s.code === "COMPLETED");
      
      let newStages: CreateWorkflowStageRequest[];
      if (completedIndex !== -1) {
        // Insert before COMPLETED
        newStages = [
          ...updatedStages.slice(0, completedIndex),
          { ...newStage },
          ...updatedStages.slice(completedIndex)
        ];
      } else {
        // No COMPLETED stage, just append
        newStages = [...updatedStages, { ...newStage }];
      }
      
      // Re-order all stages
      newStages = newStages.map((s, i) => ({ ...s, stageOrder: i }));
      
      return {
        ...prev,
        stages: newStages,
      };
    });
    
    setNewStage({ code: "", name: "", stageOrder: 0, color: "#6B7280", triggersCommission: false });
  };

  const removeStage = (code: string) => {
    // Prevent deletion of required stages
    const requiredCodes = ["DRAFT", "SUBMITTED", "COMPLETED"];
    if (requiredCodes.includes(code)) {
      return; // Do nothing for required stages
    }
    
    setFormData((prev) => ({
      ...prev,
      stages: prev.stages.filter((s) => s.code !== code).map((s, i) => ({ ...s, stageOrder: i })),
      transitions: prev.transitions.filter((t) => t.fromStageCode !== code && t.toStageCode !== code),
    }));
  };

  const addTransition = () => {
    if (!newTransition.fromStageCode || !newTransition.toStageCode) return;
    // Check if transition already exists
    const exists = formData.transitions.some(
      (t) => t.fromStageCode === newTransition.fromStageCode && t.toStageCode === newTransition.toStageCode
    );
    if (exists) return;
    setFormData((prev) => ({
      ...prev,
      transitions: [...prev.transitions, { ...newTransition }],
    }));
    setNewTransition({ fromStageCode: "", toStageCode: "", requiredPermission: "" });
  };

  const removeTransition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      transitions: prev.transitions.filter((_, i) => i !== index),
    }));
  };

  const getStageName = (code: string) => {
    const stage = formData.stages.find((s) => s.code === code);
    return stage?.name || code;
  };

  const getStageByCode = (code: string) => {
    return formData.stages.find((s) => s.code === code);
  };

  const toggleStageCommission = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      stages: prev.stages.map(s => {
        if (s.code === code) {
          // Toggle this stage's commission
          return { ...s, triggersCommission: !s.triggersCommission };
        } else if (!s.triggersCommission) {
          // Keep other stages unchanged if they don't have commission
          return s;
        } else {
          // Remove commission from other stages
          return { ...s, triggersCommission: false };
        }
      })
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cấu hình Workflow</h1>
          <p className="text-gray-600">
            Quản lý các quy trình duyệt hồ sơ trong hệ thống
          </p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (open) {
              // Initialize with required stages when opening
              resetCreateForm();
            } else {
              resetCreateForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo workflow mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo workflow mới</DialogTitle>
              <DialogDescription>
                Cấu hình quy trình duyệt hồ sơ mới với các giai đoạn và chuyển đổi
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">1. Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value="stages">2. Giai đoạn ({formData.stages.length})</TabsTrigger>
                <TabsTrigger value="transitions">3. Chuyển đổi ({formData.transitions.length})</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Tên workflow *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="VD: Quy trình duyệt vay tín chấp"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Mô tả chi tiết quy trình..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={loadDefaultTemplate}>
                    Tải mẫu mặc định
                  </Button>
                  <Button onClick={() => setActiveTab("stages")} disabled={!formData.name}>
                    Tiếp theo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </TabsContent>

              {/* Stages Tab */}
              <TabsContent value="stages" className="space-y-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    ℹ️ <strong>Lưu ý:</strong> Các giai đoạn <Badge variant="secondary" className="mx-1">DRAFT</Badge>, 
                    <Badge variant="secondary" className="mx-1">SUBMITTED</Badge>, và 
                    <Badge variant="secondary" className="mx-1">COMPLETED</Badge> là bắt buộc và không thể xóa. 
                    Giai đoạn COMPLETED sẽ luôn ở cuối workflow.
                  </p>
                </div>
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Thêm giai đoạn mới</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Mã code *</Label>
                      <Input
                        value={newStage.code}
                        onChange={(e) =>
                          setNewStage((prev) => ({
                            ...prev,
                            code: e.target.value.toUpperCase().replace(/\s/g, "_"),
                          }))
                        }
                        placeholder="VD: REVIEWING"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tên hiển thị *</Label>
                      <Input
                        value={newStage.name}
                        onChange={(e) =>
                          setNewStage((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="VD: Đang xem xét"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Màu sắc</Label>
                      <Select
                        value={newStage.color}
                        onValueChange={(v) => setNewStage((prev) => ({ ...prev, color: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: newStage.color }}
                              />
                              {STAGE_COLOR_OPTIONS.find((c) => c.value === newStage.color)?.label || newStage.color}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {STAGE_COLOR_OPTIONS.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={addStage}
                        disabled={!newStage.code || !newStage.name}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Thêm
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="triggers-commission"
                        checked={newStage.triggersCommission || false}
                        onCheckedChange={(checked: boolean | "indeterminate") =>
                          setNewStage((prev) => ({ ...prev, triggersCommission: checked === true }))
                        }
                      />
                      <Label htmlFor="triggers-commission" className="text-sm flex items-center gap-1 cursor-pointer">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Kích hoạt hoa hồng khi chuyển đến stage này
                      </Label>
                    </div>
                    {newStage.triggersCommission && (
                      <p className="text-xs text-amber-600">
                        ⚠️ Chỉ 1 stage có thể kích hoạt hoa hồng. Stage khác sẽ bị tắt tự động.
                      </p>
                    )}
                  </div>
                </div>

                {formData.stages.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thứ tự</TableHead>
                        <TableHead>Mã</TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead>Xem trước</TableHead>
                        <TableHead>Kích hoạt HH</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.stages.map((stage, index) => (
                        <TableRow key={stage.code}>
                          <TableCell>{index}</TableCell>
                          <TableCell>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {stage.code}
                            </code>
                          </TableCell>
                          <TableCell>{stage.name}</TableCell>
                          <TableCell>
                            <StageBadge
                              stage={{
                                id: stage.code,
                                workflow_id: "",
                                code: stage.code,
                                name: stage.name,
                                stage_order: stage.stageOrder,
                                color: stage.color,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div 
                              className="cursor-pointer inline-block"
                              onClick={() => toggleStageCommission(stage.code)}
                              title="Click để bật/tắt kích hoạt hoa hồng"
                            >
                              {stage.triggersCommission ? (
                                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Có
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-400 hover:bg-gray-50">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Không
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {stage.isRequired ? (
                              <Badge variant="secondary" className="text-xs">
                                Bắt buộc
                              </Badge>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStage(stage.code)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có giai đoạn nào. Thêm giai đoạn hoặc tải mẫu mặc định.</p>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("basic")}>
                    Quay lại
                  </Button>
                  <Button onClick={() => setActiveTab("transitions")} disabled={formData.stages.length < 2}>
                    Tiếp theo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </TabsContent>

              {/* Transitions Tab */}
              <TabsContent value="transitions" className="space-y-4 mt-4">
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Thêm chuyển đổi mới</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Từ giai đoạn *</Label>
                      <Select
                        value={newTransition.fromStageCode}
                        onValueChange={(v) =>
                          setNewTransition((prev) => ({ ...prev, fromStageCode: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.stages.map((stage) => (
                            <SelectItem key={stage.code} value={stage.code}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Đến giai đoạn *</Label>
                      <Select
                        value={newTransition.toStageCode}
                        onValueChange={(v) =>
                          setNewTransition((prev) => ({ ...prev, toStageCode: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.stages
                            .filter((s) => s.code !== newTransition.fromStageCode)
                            .map((stage) => (
                              <SelectItem key={stage.code} value={stage.code}>
                                {stage.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Quyền yêu cầu</Label>
                      <Input
                        value={newTransition.requiredPermission}
                        onChange={(e) =>
                          setNewTransition((prev) => ({
                            ...prev,
                            requiredPermission: e.target.value,
                          }))
                        }
                        placeholder="VD: contract:approve"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={addTransition}
                        disabled={!newTransition.fromStageCode || !newTransition.toStageCode}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Thêm
                      </Button>
                    </div>
                  </div>
                </div>

                {formData.transitions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Từ</TableHead>
                        <TableHead></TableHead>
                        <TableHead>Đến</TableHead>
                        <TableHead>Quyền yêu cầu</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.transitions.map((t, index) => {
                        const fromStage = getStageByCode(t.fromStageCode);
                        const toStage = getStageByCode(t.toStageCode);
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {fromStage && (
                                <StageBadge
                                  stage={{
                                    id: fromStage.code,
                                    workflow_id: "",
                                    code: fromStage.code,
                                    name: fromStage.name,
                                    stage_order: fromStage.stageOrder,
                                    color: fromStage.color,
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </TableCell>
                            <TableCell>
                              {toStage && (
                                <StageBadge
                                  stage={{
                                    id: toStage.code,
                                    workflow_id: "",
                                    code: toStage.code,
                                    name: toStage.name,
                                    stage_order: toStage.stageOrder,
                                    color: toStage.color,
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              {t.requiredPermission ? (
                                <Badge variant="outline">{t.requiredPermission}</Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTransition(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có chuyển đổi nào. Thêm chuyển đổi giữa các giai đoạn.</p>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("stages")}>
                    Quay lại
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="border-t pt-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createWorkflow.isPending || !formData.name}
              >
                {createWorkflow.isPending ? "Đang tạo..." : "Tạo workflow"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Workflow</CardTitle>
          <CardDescription>
            Các quy trình duyệt hồ sơ được cấu hình trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : workflows && workflows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên workflow</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Số stages</TableHead>
                  <TableHead>Số transitions</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-medium">#{workflow.id}</TableCell>
                    <TableCell>{workflow.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {workflow.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {workflow.stages?.length || 0} stages
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {workflow.transitions?.length || 0} transitions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={workflow.is_active ? "success" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleWorkflowStatus(workflow)}
                      >
                        {workflow.is_active ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/workflows/${workflow.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingWorkflow(workflow);
                            setEditFormData({
                              name: workflow.name,
                              description: workflow.description || "",
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
              <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chưa có workflow nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingWorkflow}
        onOpenChange={(open) => {
          if (!open) {
            setEditingWorkflow(null);
            setEditFormData({ name: "", description: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa workflow</DialogTitle>
            <DialogDescription>Cập nhật thông tin workflow</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên workflow</Label>
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingWorkflow(null);
                setEditFormData({ name: "", description: "" });
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={updateWorkflow.isPending}>
              {updateWorkflow.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
