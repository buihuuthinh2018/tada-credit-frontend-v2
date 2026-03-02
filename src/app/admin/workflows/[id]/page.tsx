"use client";

import { useState, use } from "react";
import {
  useWorkflow,
  useUpdateWorkflow,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
  useCreateTransition,
  useDeleteTransition,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { WorkflowStage, WorkflowTransition } from "@/types";
import { STAGE_COLOR_OPTIONS } from "@/lib/stage-utils";
import { StageBadge } from "@/components/ui/stage-badge";

interface StageFormData {
  code: string;
  name: string;
  stageOrder: number;
  color: string;
}

interface TransitionFormData {
  fromStageId: string;
  toStageId: string;
  requiredPermission: string;
}

export default function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const workflowId = resolvedParams.id;

  const { data: workflow, isLoading } = useWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflow();
  const createStage = useCreateStage();
  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();
  const createTransition = useCreateTransition();
  const deleteTransition = useDeleteTransition();

  // Stage dialogs
  const [isAddStageDialogOpen, setIsAddStageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<WorkflowStage | null>(null);
  const [deletingStage, setDeletingStage] = useState<WorkflowStage | null>(null);
  const [stageFormData, setStageFormData] = useState<StageFormData>({
    code: "",
    name: "",
    stageOrder: 0,
    color: "#6B7280",
  });

  // Transition dialogs
  const [isAddTransitionDialogOpen, setIsAddTransitionDialogOpen] = useState(false);
  const [deletingTransition, setDeletingTransition] = useState<WorkflowTransition | null>(null);
  const [transitionFormData, setTransitionFormData] = useState<TransitionFormData>({
    fromStageId: "",
    toStageId: "",
    requiredPermission: "",
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Không tìm thấy workflow</h2>
        <Link href="/admin/workflows">
          <Button className="mt-4">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const resetStageForm = () => {
    setStageFormData({
      code: "",
      name: "",
      stageOrder: (workflow.stages?.length || 0),
      color: "#6B7280",
    });
    setEditingStage(null);
  };

  const openEditStage = (stage: WorkflowStage) => {
    setEditingStage(stage);
    setStageFormData({
      code: stage.code || "",
      name: stage.name,
      stageOrder: stage.stage_order,
      color: stage.color || "#6B7280",
    });
  };

  const handleCreateStage = () => {
    createStage.mutate(
      {
        workflowId,
        data: stageFormData,
      },
      {
        onSuccess: () => {
          setIsAddStageDialogOpen(false);
          resetStageForm();
        },
      }
    );
  };

  const handleUpdateStage = () => {
    if (!editingStage) return;
    updateStage.mutate(
      {
        workflowId,
        stageId: editingStage.id,
        data: stageFormData,
      },
      {
        onSuccess: () => {
          setEditingStage(null);
          resetStageForm();
        },
      }
    );
  };

  const handleDeleteStage = () => {
    if (!deletingStage) return;
    deleteStage.mutate(
      {
        workflowId,
        stageId: deletingStage.id,
      },
      {
        onSuccess: () => {
          setDeletingStage(null);
        },
      }
    );
  };

  const resetTransitionForm = () => {
    setTransitionFormData({
      fromStageId: "",
      toStageId: "",
      requiredPermission: "",
    });
  };

  const handleCreateTransition = () => {
    createTransition.mutate(
      {
        workflowId,
        data: {
          fromStageId: transitionFormData.fromStageId,
          toStageId: transitionFormData.toStageId,
          requiredPermission: transitionFormData.requiredPermission || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsAddTransitionDialogOpen(false);
          resetTransitionForm();
        },
      }
    );
  };

  const handleDeleteTransition = () => {
    if (!deletingTransition) return;
    deleteTransition.mutate(
      {
        workflowId,
        transitionId: deletingTransition.id,
      },
      {
        onSuccess: () => {
          setDeletingTransition(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/workflows">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{workflow.name}</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <span>Version {workflow.version}</span>
              <span>•</span>
              {workflow.is_active ? (
                <Badge variant="success">Hoạt động</Badge>
              ) : (
                <Badge variant="secondary">Tạm dừng</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Các giai đoạn (Stages)
              </CardTitle>
              <CardDescription>
                Quản lý các giai đoạn và màu sắc hiển thị
              </CardDescription>
            </div>
            <Dialog
              open={isAddStageDialogOpen}
              onOpenChange={(open) => {
                setIsAddStageDialogOpen(open);
                if (!open) resetStageForm();
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={resetStageForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm stage
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm giai đoạn mới</DialogTitle>
                  <DialogDescription>
                    Cấu hình giai đoạn mới cho workflow
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Mã stage (code)</Label>
                    <Input
                      value={stageFormData.code}
                      onChange={(e) =>
                        setStageFormData((prev) => ({
                          ...prev,
                          code: e.target.value.toUpperCase().replace(/\s/g, "_"),
                        }))
                      }
                      placeholder="VD: REVIEWING, APPROVED"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tên hiển thị</Label>
                    <Input
                      value={stageFormData.name}
                      onChange={(e) =>
                        setStageFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="VD: Đang xem xét, Đã duyệt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Thứ tự</Label>
                    <Input
                      type="number"
                      value={stageFormData.stageOrder}
                      onChange={(e) =>
                        setStageFormData((prev) => ({
                          ...prev,
                          stageOrder: parseInt(e.target.value) || 0,
                        }))
                      }
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Màu sắc</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {STAGE_COLOR_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setStageFormData((prev) => ({ ...prev, color: option.value }))
                          }
                          className={`
                            w-full aspect-square rounded-lg border-2 transition-all
                            ${stageFormData.color === option.value
                              ? "border-primary ring-2 ring-primary ring-offset-2"
                              : "border-transparent hover:border-gray-300"
                            }
                          `}
                          style={{ backgroundColor: option.value }}
                          title={option.label}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Label>Hoặc nhập mã màu:</Label>
                      <Input
                        type="text"
                        value={stageFormData.color}
                        onChange={(e) =>
                          setStageFormData((prev) => ({ ...prev, color: e.target.value }))
                        }
                        placeholder="#FF5733"
                        className="w-32"
                      />
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: stageFormData.color }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Xem trước</Label>
                    <div className="flex items-center gap-2">
                      <StageBadge
                        stage={{
                          id: "preview",
                          workflow_id: workflowId,
                          name: stageFormData.name || "Tên stage",
                          code: stageFormData.code || "CODE",
                          stage_order: stageFormData.stageOrder,
                          color: stageFormData.color,
                        }}
                      />
                      <StageBadge
                        stage={{
                          id: "preview",
                          workflow_id: workflowId,
                          name: stageFormData.name || "Tên stage",
                          code: stageFormData.code || "CODE",
                          stage_order: stageFormData.stageOrder,
                          color: stageFormData.color,
                        }}
                        variant="solid"
                      />
                      <StageBadge
                        stage={{
                          id: "preview",
                          workflow_id: workflowId,
                          name: stageFormData.name || "Tên stage",
                          code: stageFormData.code || "CODE",
                          stage_order: stageFormData.stageOrder,
                          color: stageFormData.color,
                        }}
                        variant="outline"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddStageDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleCreateStage}
                    disabled={createStage.isPending || !stageFormData.code || !stageFormData.name}
                  >
                    {createStage.isPending ? "Đang tạo..." : "Thêm stage"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {workflow.stages && workflow.stages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Màu</TableHead>
                  <TableHead>Xem trước</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflow.stages
                  .sort((a, b) => a.stage_order - b.stage_order)
                  .map((stage) => (
                    <TableRow key={stage.id}>
                      <TableCell>{stage.stage_order}</TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {stage.code}
                        </code>
                      </TableCell>
                      <TableCell>{stage.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: stage.color || "#6B7280" }}
                          />
                          <span className="text-sm text-gray-500">
                            {stage.color || "#6B7280"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StageBadge stage={stage} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditStage(stage)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingStage(stage)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có stage nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transitions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chuyển đổi (Transitions)</CardTitle>
              <CardDescription>
                Các đường chuyển đổi giữa các giai đoạn
              </CardDescription>
            </div>
            <Dialog
              open={isAddTransitionDialogOpen}
              onOpenChange={(open) => {
                setIsAddTransitionDialogOpen(open);
                if (!open) resetTransitionForm();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" onClick={resetTransitionForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm transition
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm transition mới</DialogTitle>
                  <DialogDescription>
                    Cấu hình đường chuyển đổi giữa các giai đoạn
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Từ giai đoạn</Label>
                    <Select
                      value={transitionFormData.fromStageId}
                      onValueChange={(value) =>
                        setTransitionFormData((prev) => ({ ...prev, fromStageId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giai đoạn bắt đầu" />
                      </SelectTrigger>
                      <SelectContent>
                        {workflow.stages?.map((stage) => (
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
                  <div className="space-y-2">
                    <Label>Đến giai đoạn</Label>
                    <Select
                      value={transitionFormData.toStageId}
                      onValueChange={(value) =>
                        setTransitionFormData((prev) => ({ ...prev, toStageId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giai đoạn đến" />
                      </SelectTrigger>
                      <SelectContent>
                        {workflow.stages?.map((stage) => (
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
                  <div className="space-y-2">
                    <Label>Quyền yêu cầu (tùy chọn)</Label>
                    <Input
                      value={transitionFormData.requiredPermission}
                      onChange={(e) =>
                        setTransitionFormData((prev) => ({
                          ...prev,
                          requiredPermission: e.target.value,
                        }))
                      }
                      placeholder="VD: contract:approve"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddTransitionDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleCreateTransition}
                    disabled={
                      createTransition.isPending ||
                      !transitionFormData.fromStageId ||
                      !transitionFormData.toStageId
                    }
                  >
                    {createTransition.isPending ? "Đang tạo..." : "Thêm transition"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {workflow.transitions && workflow.transitions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Từ</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Đến</TableHead>
                  <TableHead>Quyền yêu cầu</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflow.transitions.map((transition) => (
                  <TableRow key={transition.id}>
                    <TableCell>
                      <StageBadge stage={transition.from_stage} />
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </TableCell>
                    <TableCell>
                      <StageBadge stage={transition.to_stage} />
                    </TableCell>
                    <TableCell>
                      {transition.required_permissions?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {transition.required_permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingTransition(transition)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có transition nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Stage Dialog */}
      <Dialog
        open={!!editingStage}
        onOpenChange={(open) => {
          if (!open) {
            setEditingStage(null);
            resetStageForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa giai đoạn</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin giai đoạn &quot;{editingStage?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mã stage (code)</Label>
              <Input
                value={stageFormData.code}
                onChange={(e) =>
                  setStageFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase().replace(/\s/g, "_"),
                  }))
                }
                placeholder="VD: REVIEWING, APPROVED"
              />
            </div>
            <div className="space-y-2">
              <Label>Tên hiển thị</Label>
              <Input
                value={stageFormData.name}
                onChange={(e) =>
                  setStageFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="VD: Đang xem xét, Đã duyệt"
              />
            </div>
            <div className="space-y-2">
              <Label>Thứ tự</Label>
              <Input
                type="number"
                value={stageFormData.stageOrder}
                onChange={(e) =>
                  setStageFormData((prev) => ({
                    ...prev,
                    stageOrder: parseInt(e.target.value) || 0,
                  }))
                }
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Màu sắc</Label>
              <div className="grid grid-cols-5 gap-2">
                {STAGE_COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setStageFormData((prev) => ({ ...prev, color: option.value }))
                    }
                    className={`
                      w-full aspect-square rounded-lg border-2 transition-all
                      ${stageFormData.color === option.value
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-transparent hover:border-gray-300"
                      }
                    `}
                    style={{ backgroundColor: option.value }}
                    title={option.label}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label>Hoặc nhập mã màu:</Label>
                <Input
                  type="text"
                  value={stageFormData.color}
                  onChange={(e) =>
                    setStageFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  placeholder="#FF5733"
                  className="w-32"
                />
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: stageFormData.color }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Xem trước</Label>
              <div className="flex items-center gap-2">
                <StageBadge
                  stage={{
                    id: "preview",
                    workflow_id: workflowId,
                    name: stageFormData.name || "Tên stage",
                    code: stageFormData.code || "CODE",
                    stage_order: stageFormData.stageOrder,
                    color: stageFormData.color,
                  }}
                />
                <StageBadge
                  stage={{
                    id: "preview",
                    workflow_id: workflowId,
                    name: stageFormData.name || "Tên stage",
                    code: stageFormData.code || "CODE",
                    stage_order: stageFormData.stageOrder,
                    color: stageFormData.color,
                  }}
                  variant="solid"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingStage(null);
                resetStageForm();
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateStage}
              disabled={updateStage.isPending || !stageFormData.code || !stageFormData.name}
            >
              {updateStage.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Stage Confirmation */}
      <AlertDialog open={!!deletingStage} onOpenChange={() => setDeletingStage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa stage</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa stage &quot;{deletingStage?.name}&quot;? Hành động này không
              thể hoàn tác và sẽ xóa tất cả transitions liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStage}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteStage.isPending ? "Đang xóa..." : "Xóa stage"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Transition Confirmation */}
      <AlertDialog
        open={!!deletingTransition}
        onOpenChange={() => setDeletingTransition(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa transition</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa transition từ &quot;
              {deletingTransition?.from_stage?.name}&quot; đến &quot;
              {deletingTransition?.to_stage?.name}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransition}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteTransition.isPending ? "Đang xóa..." : "Xóa transition"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
