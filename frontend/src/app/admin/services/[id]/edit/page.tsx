"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  useService,
  useUpdateService,
  useAddDocumentToService,
  useRemoveDocumentFromService,
  useAddQuestionToService,
  useRemoveQuestionFromService,
} from "@/hooks/use-services";
import { useWorkflows } from "@/hooks/use-workflows";
import { useDocumentRequirements } from "@/hooks/use-documents";
import { useQuestions } from "@/hooks/use-questions";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const { data: service, isLoading } = useService(serviceId);
  const updateMutation = useUpdateService();
  const addDocMutation = useAddDocumentToService();
  const removeDocMutation = useRemoveDocumentFromService();
  const addQuestionMutation = useAddQuestionToService();
  const removeQuestionMutation = useRemoveQuestionFromService();
  const { data: workflows } = useWorkflows();
  const { data: documentRequirements } = useDocumentRequirements();
  const { data: questions } = useQuestions({ activeOnly: true, limit: 1000 });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
    commission_enabled: true,
  });

  const [docSearch, setDocSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [showAddDocDialog, setShowAddDocDialog] = useState(false);
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || "",
        is_active: service.is_active,
        commission_enabled: service.commission_enabled ?? true,
      });
    }
  }, [service]);

  const availableDocs = documentRequirements?.filter((doc) => {
    const isAlreadyAdded = service?.documentRequirements?.some((d) => d.id === doc.id);
    const matchesSearch =
      doc.name.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.code.toLowerCase().includes(docSearch.toLowerCase());
    return !isAlreadyAdded && matchesSearch;
  });

  const availableQuestions = questions?.filter((q) => {
    const isAlreadyAdded = service?.questions?.some((sq) => sq.id === q.id);
    const matchesSearch = q.content.toLowerCase().includes(questionSearch.toLowerCase());
    return !isAlreadyAdded && matchesSearch;
  });

  const handleAddDocument = (docId: string, isRequired: boolean) => {
    addDocMutation.mutate(
      { serviceId, documentId: docId, isRequired },
      {
        onSuccess: () => {
          setShowAddDocDialog(false);
          setDocSearch("");
        },
      }
    );
  };

  const handleRemoveDocument = (docId: string) => {
    if (!confirm("Bạn có chắc muốn xóa tài liệu này khỏi dịch vụ?")) return;
    removeDocMutation.mutate({ serviceId, documentId: docId });
  };

  const handleAddQuestion = (questionId: string, isRequired: boolean) => {
    const sortOrder = service?.questions?.length ?? 0;
    addQuestionMutation.mutate(
      { serviceId, questionId, isRequired, sortOrder },
      {
        onSuccess: () => {
          setShowAddQuestionDialog(false);
          setQuestionSearch("");
        },
      }
    );
  };

  const handleRemoveQuestion = (questionId: string) => {
    if (!confirm("Bạn có chắc muốn xóa câu hỏi này khỏi dịch vụ?")) return;
    removeQuestionMutation.mutate({ serviceId, questionId });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      return toast.error("Vui lòng nhập tên dịch vụ");
    }

    updateMutation.mutate(
      {
        id: serviceId,
        data: {
          name: formData.name,
          description: formData.description,
          is_active: formData.is_active,
          commission_enabled: formData.commission_enabled,
        },
      },
      {
        onSuccess: () => {
          router.push(`/admin/services/${serviceId}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không tìm thấy dịch vụ</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/services")}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/services/${serviceId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Chỉnh sửa dịch vụ</h1>
            <p className="text-muted-foreground mt-1">{service.name}</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>Cập nhật tên, mô tả và trạng thái</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tên dịch vụ *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="VD: Vay Tín Chấp V1"
            />
          </div>
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả chi tiết về dịch vụ"
              rows={4}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: !!checked }))
              }
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Dịch vụ đang hoạt động
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="commission_enabled"
              checked={formData.commission_enabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, commission_enabled: !!checked }))
              }
            />
            <Label htmlFor="commission_enabled" className="cursor-pointer">
              Tính hoa hồng khi hoàn thành hợp đồng
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Workflow - Read-only (cannot change after creation) */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow</CardTitle>
          <CardDescription>
            Workflow không thể thay đổi sau khi tạo dịch vụ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">{service.workflow?.name}</p>
            {service.workflow?.stages && (
              <div className="flex flex-wrap gap-2 mt-2">
                {service.workflow.stages
                  .sort((a, b) => a.stage_order - b.stage_order)
                  .map((stage) => (
                    <Badge
                      key={stage.id}
                      variant="outline"
                      style={{ borderColor: stage.color, color: stage.color }}
                    >
                      {stage.code}
                    </Badge>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Requirements - Now editable */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Yêu cầu tài liệu</CardTitle>
            <CardDescription>
              Hiện tại: {service.documentRequirements?.length || 0} loại tài liệu
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddDocDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm tài liệu
          </Button>
        </CardHeader>
        <CardContent>
          {service.documentRequirements && service.documentRequirements.length > 0 ? (
            <div className="space-y-2">
              {service.documentRequirements.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={doc.isRequired ? "default" : "secondary"}>
                      {doc.isRequired ? "Bắt buộc" : "Tùy chọn"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDocument(doc.id)}
                      disabled={removeDocMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Chưa có tài liệu nào</p>
          )}
        </CardContent>
      </Card>

      {/* Questions - Now editable */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Câu hỏi bổ sung</CardTitle>
            <CardDescription>
              Hiện tại: {service.questions?.length || 0} câu hỏi
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddQuestionDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm câu hỏi
          </Button>
        </CardHeader>
        <CardContent>
          {service.questions && service.questions.length > 0 ? (
            <div className="space-y-2">
              {service.questions
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((q, index) => (
                  <div
                    key={q.id}
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <p className="font-medium">{q.content}</p>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {q.type}
                        </Badge>
                        {q.isRequired && (
                          <Badge variant="default" className="text-xs">
                            Bắt buộc
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuestion(q.id)}
                      disabled={removeQuestionMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Chưa có câu hỏi nào</p>
          )}
        </CardContent>
      </Card>

      {/* Add Document Dialog */}
      <Dialog open={showAddDocDialog} onOpenChange={setShowAddDocDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm yêu cầu tài liệu</DialogTitle>
            <DialogDescription>Chọn loại tài liệu cần thêm vào dịch vụ</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm tài liệu..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableDocs && availableDocs.length > 0 ? (
                availableDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.code}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddDocument(doc.id, false)}
                        disabled={addDocMutation.isPending}
                      >
                        Tùy chọn
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddDocument(doc.id, true)}
                        disabled={addDocMutation.isPending}
                      >
                        Bắt buộc
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {docSearch ? "Không tìm thấy tài liệu" : "Đã thêm tất cả tài liệu"}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={showAddQuestionDialog} onOpenChange={setShowAddQuestionDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm câu hỏi bổ sung</DialogTitle>
            <DialogDescription>Chọn câu hỏi cần thêm vào dịch vụ</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm câu hỏi..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableQuestions && availableQuestions.length > 0 ? (
                availableQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{q.content}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {q.type}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddQuestion(q.id, false)}
                        disabled={addQuestionMutation.isPending}
                      >
                        Tùy chọn
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddQuestion(q.id, true)}
                        disabled={addQuestionMutation.isPending}
                      >
                        Bắt buộc
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {questionSearch ? "Không tìm thấy câu hỏi" : "Đã thêm tất cả câu hỏi"}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
