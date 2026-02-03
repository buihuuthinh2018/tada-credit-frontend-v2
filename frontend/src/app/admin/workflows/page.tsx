"use client";

import { useState } from "react";
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
import { GitBranch, Plus, Edit, Eye } from "lucide-react";
import { Workflow } from "@/types";
import Link from "next/link";

export default function AdminWorkflowsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { data: workflows, isLoading } = useWorkflows();
  const createWorkflow = useCreateWorkflow();
  const updateWorkflow = useUpdateWorkflow();

  const handleCreate = () => {
    createWorkflow.mutate(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setFormData({ name: "", description: "" });
      },
    });
  };

  const handleUpdate = () => {
    if (!editingWorkflow) return;
    updateWorkflow.mutate(
      { id: editingWorkflow.id, data: formData },
      {
        onSuccess: () => {
          setEditingWorkflow(null);
          setFormData({ name: "", description: "" });
        },
      }
    );
  };

  const toggleWorkflowStatus = (workflow: Workflow) => {
    updateWorkflow.mutate({
      id: workflow.id,
      data: { isActive: !workflow.isActive },
    });
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo workflow mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo workflow mới</DialogTitle>
              <DialogDescription>
                Cấu hình quy trình duyệt hồ sơ mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tên workflow</Label>
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleCreate} disabled={createWorkflow.isPending}>
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
                        variant={workflow.isActive ? "success" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleWorkflowStatus(workflow)}
                      >
                        {workflow.isActive ? "Hoạt động" : "Tạm dừng"}
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
                            setFormData({
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
            setFormData({ name: "", description: "" });
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
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingWorkflow(null);
                setFormData({ name: "", description: "" });
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
