"use client";

import { useMemo, useState } from "react";
import {
  useCreateDocumentRequirement,
  useDocumentRequirements,
  useUpdateDocumentRequirement,
} from "@/hooks/use-documents";
import type { DocumentRequirement } from "@/types";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Edit, Plus } from "lucide-react";
import { toast } from "sonner";

type FormState = {
  code: string;
  name: string;
  maxFiles: number;
  allowedTypesText: string;
  maxSizeMB: number;
};

function bytesToMB(bytes: number) {
  return bytes / 1024 / 1024;
}

function mbToBytes(mb: number) {
  return Math.round(mb * 1024 * 1024);
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function parseAllowedTypes(text: string) {
  return text
    .split(/[,;\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function defaultFormState(): FormState {
  return {
    code: "",
    name: "",
    maxFiles: 1,
    allowedTypesText: ".pdf, .jpg, .png",
    maxSizeMB: 10,
  };
}

export default function AdminDocumentsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRequirement | null>(null);
  const [form, setForm] = useState<FormState>(() => defaultFormState());

  const { data: documents, isLoading } = useDocumentRequirements();
  const createMutation = useCreateDocumentRequirement();
  const updateMutation = useUpdateDocumentRequirement();

  const sortedDocuments = useMemo(() => {
    const list = documents ?? [];
    return [...list].sort((a, b) => a.code.localeCompare(b.code));
  }, [documents]);

  const isBusy = isLoading || createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setForm(defaultFormState());
    setEditingDoc(null);
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
    setForm(defaultFormState());
  };

  const openEdit = (doc: DocumentRequirement) => {
    setEditingDoc(doc);
    setForm({
      code: doc.code,
      name: doc.name,
      maxFiles: doc.config?.maxFiles ?? 1,
      allowedTypesText: (doc.config?.allowedTypes ?? []).join(", "),
      maxSizeMB: Math.max(
        1,
        Math.round(bytesToMB(doc.config?.maxSizeBytes ?? 0) || 10)
      ),
    });
  };

  const closeEdit = () => {
    setEditingDoc(null);
    setForm(defaultFormState());
  };

  const submitCreate = () => {
    const code = form.code.trim().toUpperCase();
    const name = form.name.trim();
    const allowedTypes = parseAllowedTypes(form.allowedTypesText);

    if (!code) return toast.error("Vui lòng nhập code");
    if (!name) return toast.error("Vui lòng nhập tên tài liệu");
    if (!Number.isFinite(form.maxFiles) || form.maxFiles < 1) {
      return toast.error("Số file tối đa phải >= 1");
    }
    if (!Number.isFinite(form.maxSizeMB) || form.maxSizeMB < 1) {
      return toast.error("Kích thước tối đa phải >= 1 MB");
    }
    if (allowedTypes.length === 0) {
      return toast.error("Vui lòng nhập ít nhất 1 định dạng (allowed types)");
    }

    createMutation.mutate(
      {
        code,
        name,
        config: {
          maxFiles: form.maxFiles,
          allowedTypes,
          maxSizeBytes: mbToBytes(form.maxSizeMB),
        },
      },
      {
        onSuccess: () => {
          closeCreate();
        },
      }
    );
  };

  const submitUpdate = () => {
    if (!editingDoc) return;

    const name = form.name.trim();
    const allowedTypes = parseAllowedTypes(form.allowedTypesText);

    if (!name) return toast.error("Vui lòng nhập tên tài liệu");
    if (!Number.isFinite(form.maxFiles) || form.maxFiles < 1) {
      return toast.error("Số file tối đa phải >= 1");
    }
    if (!Number.isFinite(form.maxSizeMB) || form.maxSizeMB < 1) {
      return toast.error("Kích thước tối đa phải >= 1 MB");
    }
    if (allowedTypes.length === 0) {
      return toast.error("Vui lòng nhập ít nhất 1 định dạng (allowed types)");
    }

    updateMutation.mutate(
      {
        id: editingDoc.id,
        data: {
          name,
          config: {
            maxFiles: form.maxFiles,
            allowedTypes,
            maxSizeBytes: mbToBytes(form.maxSizeMB),
          },
        },
      },
      {
        onSuccess: () => {
          closeEdit();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Document Requirements</CardTitle>
            <CardDescription>
              Tạo document type template (code + config). Bắt buộc/Tùy chọn được cấu hình
              theo từng Service.
            </CardDescription>
          </div>

          <Dialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              if (open) openCreate();
              else closeCreate();
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo mới
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tạo document requirement</DialogTitle>
                <DialogDescription>
                  Payload gửi backend: code, name, config (maxFiles, allowedTypes, maxSizeBytes).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    value={form.code}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                    }
                    placeholder="VD: BANK_STATEMENT"
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground">Code không thể thay đổi sau khi tạo.</p>
                </div>

                <div className="space-y-2">
                  <Label>Tên</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Sao kê ngân hàng"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max files</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.maxFiles}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          maxFiles: Number.parseInt(e.target.value || "1", 10) || 1,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max size (MB)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.maxSizeMB}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          maxSizeMB: Number.parseInt(e.target.value || "10", 10) || 10,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allowed types</Label>
                  <Input
                    value={form.allowedTypesText}
                    onChange={(e) => setForm((prev) => ({ ...prev, allowedTypesText: e.target.value }))}
                    placeholder=".pdf, .jpg, .png"
                  />
                  <p className="text-xs text-muted-foreground">Phân tách bằng dấu phẩy/; hoặc xuống dòng.</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeCreate} disabled={isBusy}>
                  Hủy
                </Button>
                <Button onClick={submitCreate} disabled={isBusy}>
                  Tạo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead className="text-center">Max files</TableHead>
                    <TableHead>Allowed types</TableHead>
                    <TableHead className="text-center">Max size</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="w-22.5 text-right">&nbsp;</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Chưa có document requirement nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-mono text-xs">{doc.code}</TableCell>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell className="text-center">{doc.config?.maxFiles ?? "-"}</TableCell>
                        <TableCell className="max-w-90 truncate">
                          {(doc.config?.allowedTypes ?? []).join(", ") || "-"}
                        </TableCell>
                        <TableCell className="text-center">{formatBytes(doc.config?.maxSizeBytes ?? 0)}</TableCell>
                        <TableCell className="text-center">
                          {doc.is_active ? <Badge variant="default">ACTIVE</Badge> : <Badge variant="secondary">INACTIVE</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(doc)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingDoc} onOpenChange={(open) => (!open ? closeEdit() : undefined)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa document requirement</DialogTitle>
            <DialogDescription>
              Code không đổi. Bắt buộc/Tùy chọn cấu hình khi tạo Service.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={form.code} disabled />
            </div>

            <div className="space-y-2">
              <Label>Tên</Label>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max files</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxFiles}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      maxFiles: Number.parseInt(e.target.value || "1", 10) || 1,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max size (MB)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxSizeMB}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      maxSizeMB: Number.parseInt(e.target.value || "10", 10) || 10,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Allowed types</Label>
              <Input
                value={form.allowedTypesText}
                onChange={(e) => setForm((prev) => ({ ...prev, allowedTypesText: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEdit} disabled={isBusy}>
              Đóng
            </Button>
            <Button onClick={submitUpdate} disabled={isBusy}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
