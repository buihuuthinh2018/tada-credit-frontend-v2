"use client";

import { useState } from "react";
import {
  useDocumentRequirements,
  useCreateDocumentRequirement,
  useUpdateDocumentRequirement,
} from "@/hooks/use-documents";
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
import { FileCheck, Plus, Edit } from "lucide-react";
import { DocumentRequirement } from "@/types";

export default function AdminDocumentsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRequirement | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isRequired: true,
    maxFiles: 1,
    allowedFormats: [".pdf", ".jpg", ".png"],
    maxSizeBytes: 10485760,
  });

  const { data: documents, isLoading } = useDocumentRequirements();
  const createDoc = useCreateDocumentRequirement();
  const updateDoc = useUpdateDocumentRequirement();

  const handleCreate = () => {
    createDoc.mutate(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        resetForm();
      },
    });
  };

  const handleUpdate = () => {
    if (!editingDoc) return;
    updateDoc.mutate(
      { id: editingDoc.id, data: formData },
      {
        onSuccess: () => {
          setEditingDoc(null);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      isRequired: true,
      maxFiles: 1,
      allowedFormats: [".pdf", ".jpg", ".png"],
      maxSizeBytes: 10485760,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cấu hình Tài liệu</h1>
          <p className="text-gray-600">
            Quản lý các yêu cầu tài liệu trong hệ thống
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo yêu cầu mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo yêu cầu tài liệu</DialogTitle>
              <DialogDescription>
                Cấu hình yêu cầu tài liệu mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tên tài liệu</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="VD: CMND/CCCD"
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
                  placeholder="Mô tả chi tiết..."
                />
              </div>
              <div className="space-y-2">
                <Label>Bắt buộc</Label>
                <Select
                  value={formData.isRequired ? "yes" : "no"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      isRequired: value === "yes",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Có</SelectItem>
                    <SelectItem value="no">Không</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Số file tối đa</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.maxFiles}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxFiles: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Kích thước tối đa (MB)</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.maxSizeBytes / 1048576}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxSizeBytes: (parseFloat(e.target.value) || 1) * 1048576,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleCreate} disabled={createDoc.isPending}>
                {createDoc.isPending ? "Đang tạo..." : "Tạo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu tài liệu</CardTitle>
          <CardDescription>
            Các loại tài liệu được cấu hình trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : documents && documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên tài liệu</TableHead>
                  <TableHead>Bắt buộc</TableHead>
                  <TableHead>Số file tối đa</TableHead>
                  <TableHead>Kích thước tối đa</TableHead>
                  <TableHead>Định dạng</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">#{doc.id}</TableCell>
                    <TableCell>
                      {doc.name}
                      {doc.description && (
                        <p className="text-sm text-gray-500">{doc.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.isRequired ? "destructive" : "secondary"}>
                        {doc.isRequired ? "Bắt buộc" : "Tùy chọn"}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.maxFiles} file(s)</TableCell>
                    <TableCell>{formatFileSize(doc.maxSizeBytes)}</TableCell>
                    <TableCell>
                      {doc.allowedFormats?.join(", ") || "Tất cả"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingDoc(doc);
                          setFormData({
                            name: doc.name,
                            description: doc.description || "",
                            isRequired: doc.isRequired,
                            maxFiles: doc.maxFiles,
                            allowedFormats: doc.allowedFormats,
                            maxSizeBytes: doc.maxSizeBytes,
                          });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chưa có yêu cầu tài liệu nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingDoc}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDoc(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa yêu cầu tài liệu</DialogTitle>
            <DialogDescription>Cập nhật cấu hình tài liệu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên tài liệu</Label>
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
            <div className="space-y-2">
              <Label>Bắt buộc</Label>
              <Select
                value={formData.isRequired ? "yes" : "no"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    isRequired: value === "yes",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Có</SelectItem>
                  <SelectItem value="no">Không</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Số file tối đa</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={formData.maxFiles}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxFiles: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingDoc(null);
                resetForm();
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={updateDoc.isPending}>
              {updateDoc.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
