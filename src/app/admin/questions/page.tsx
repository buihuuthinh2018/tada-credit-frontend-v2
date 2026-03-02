"use client";

import { useMemo, useState } from "react";
import {
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks/use-questions";
import type { Question, QuestionType } from "@/types";

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
import { Checkbox } from "@/components/ui/checkbox";
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

import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type FormState = {
  content: string;
  type: QuestionType;
  options: string[];
  optionsText: string;
  placeholder: string;
  min?: number;
  max?: number;
  isCurrency?: boolean;  // Flag for currency formatting
};

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "text", label: "Text (Văn bản ngắn)" },
  { value: "textarea", label: "Textarea (Văn bản dài)" },
  { value: "number", label: "Number (Số)" },
  { value: "date", label: "Date (Ngày tháng)" },
  { value: "select", label: "Select (Chọn 1)" },
  { value: "multiselect", label: "Multi-select (Chọn nhiều)" },
];

function defaultFormState(): FormState {
  return {
    content: "",
    type: "text",
    options: [],
    optionsText: "",
    placeholder: "",
    min: undefined,
    max: undefined,
    isCurrency: false,
  };
}

function parseOptions(text: string): string[] {
  return text
    .split(/[\n,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminQuestionsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [form, setForm] = useState<FormState>(() => defaultFormState());

  const { data: questions, isLoading } = useQuestions({ activeOnly: false });
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();

  const sortedQuestions = useMemo(() => {
    const list = questions ?? [];
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [questions]);

  const isBusy = isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const openCreate = () => {
    setForm(defaultFormState());
    setEditingQuestion(null);
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
    setForm(defaultFormState());
  };

  const openEdit = (question: Question) => {
    setEditingQuestion(question);
    setForm({
      content: question.content,
      type: question.type,
      options: question.config?.options ?? [],
      optionsText: (question.config?.options ?? []).join("\n"),
      placeholder: question.config?.placeholder ?? "",
      min: question.config?.min,
      max: question.config?.max,
      isCurrency: question.config?.isCurrency ?? false,
    });
  };

  const closeEdit = () => {
    setEditingQuestion(null);
    setForm(defaultFormState());
  };

  const requiresOptions = (type: QuestionType) => type === "select" || type === "multiselect";
  const requiresMinMax = (type: QuestionType) => type === "number";

  const submitCreate = () => {
    const content = form.content.trim();
    if (!content) return toast.error("Vui lòng nhập nội dung câu hỏi");
    if (!form.type) return toast.error("Vui lòng chọn loại câu hỏi");

    const config: any = {};
    if (form.placeholder) config.placeholder = form.placeholder;

    if (requiresOptions(form.type)) {
      const options = parseOptions(form.optionsText);
      if (options.length === 0) {
        return toast.error("Vui lòng nhập ít nhất 1 lựa chọn cho loại câu hỏi này");
      }
      config.options = options;
    }

    if (requiresMinMax(form.type)) {
      if (form.min !== undefined) config.min = form.min;
      if (form.max !== undefined) config.max = form.max;
      if (form.isCurrency) config.isCurrency = true;
    }

    createMutation.mutate(
      {
        content,
        type: form.type,
        config: Object.keys(config).length > 0 ? config : undefined,
      },
      {
        onSuccess: () => {
          closeCreate();
        },
      }
    );
  };

  const submitUpdate = () => {
    if (!editingQuestion) return;

    const content = form.content.trim();
    if (!content) return toast.error("Vui lòng nhập nội dung câu hỏi");
    if (!form.type) return toast.error("Vui lòng chọn loại câu hỏi");

    const config: any = {};
    if (form.placeholder) config.placeholder = form.placeholder;

    if (requiresOptions(form.type)) {
      const options = parseOptions(form.optionsText);
      if (options.length === 0) {
        return toast.error("Vui lòng nhập ít nhất 1 lựa chọn cho loại câu hỏi này");
      }
      config.options = options;
    }

    if (requiresMinMax(form.type)) {
      if (form.min !== undefined) config.min = form.min;
      if (form.max !== undefined) config.max = form.max;
      if (form.isCurrency) config.isCurrency = true;
    }

    updateMutation.mutate(
      {
        id: editingQuestion.id,
        data: {
          content,
          type: form.type,
          config: Object.keys(config).length > 0 ? config : undefined,
        },
      },
      {
        onSuccess: () => {
          closeEdit();
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Câu hỏi bổ sung</CardTitle>
            <CardDescription>
              Tạo các câu hỏi template để yêu cầu thông tin bổ sung khi tạo hợp đồng.
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
                Tạo câu hỏi
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tạo câu hỏi mới</DialogTitle>
                <DialogDescription>
                  Câu hỏi này sẽ hiển thị trong form tạo hợp đồng (nếu service yêu cầu).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nội dung câu hỏi *</Label>
                  <Input
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="VD: Số năm kinh nghiệm làm việc?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Loại câu hỏi *</Label>
                  <Select
                    value={form.type}
                    onValueChange={(val: QuestionType) =>
                      setForm((prev) => ({ ...prev, type: val, optionsText: "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((qt) => (
                        <SelectItem key={qt.value} value={qt.value}>
                          {qt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Placeholder (tùy chọn)</Label>
                  <Input
                    value={form.placeholder}
                    onChange={(e) => setForm((prev) => ({ ...prev, placeholder: e.target.value }))}
                    placeholder="VD: Nhập số năm..."
                  />
                </div>

                {requiresOptions(form.type) && (
                  <div className="space-y-2">
                    <Label>Danh sách lựa chọn *</Label>
                    <textarea
                      className="w-full min-h-24 px-3 py-2 border rounded-md"
                      value={form.optionsText}
                      onChange={(e) => setForm((prev) => ({ ...prev, optionsText: e.target.value }))}
                      placeholder="Mỗi lựa chọn 1 dòng hoặc phân tách bằng dấu phẩy"
                    />
                    <p className="text-xs text-muted-foreground">
                      VD: Dưới 1 năm, 1-3 năm, Trên 3 năm
                    </p>
                  </div>
                )}

                {requiresMinMax(form.type) && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Giá trị min (tùy chọn)</Label>
                        <Input
                          type="number"
                          value={form.min ?? ""}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              min: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Giá trị max (tùy chọn)</Label>
                        <Input
                          type="number"
                          value={form.max ?? ""}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              max: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <Checkbox
                        id="isCurrency"
                        checked={form.isCurrency}
                        onCheckedChange={(checked: boolean | 'indeterminate') =>
                          setForm((prev) => ({ ...prev, isCurrency: checked === true }))
                        }
                      />
                      <Label htmlFor="isCurrency" className="cursor-pointer">
                        Định dạng tiền tệ VND (1.000.000)
                      </Label>
                    </div>
                  </>
                )}
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
                    <TableHead>Câu hỏi</TableHead>
                    <TableHead className="text-center">Loại</TableHead>
                    <TableHead>Config</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="w-22.5 text-right">&nbsp;</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedQuestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Chưa có câu hỏi nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedQuestions.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{q.content}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{q.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-90 truncate text-xs text-muted-foreground">
                          {q.config?.options && (
                            <span>Options: {q.config.options.join(", ")}</span>
                          )}
                          {q.config?.placeholder && (
                            <span>Placeholder: {q.config.placeholder}</span>
                          )}
                          {q.config?.min !== undefined && <span>Min: {q.config.min}</span>}
                          {q.config?.max !== undefined && <span>Max: {q.config.max}</span>}
                          {q.config?.isCurrency && (
                            <Badge variant="secondary" className="ml-1">💰 Currency</Badge>
                          )}
                          {!q.config && <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {q.is_active ? (
                            <Badge variant="default">ACTIVE</Badge>
                          ) : (
                            <Badge variant="secondary">INACTIVE</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(q.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={(open) => (!open ? closeEdit() : undefined)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa câu hỏi</DialogTitle>
            <DialogDescription>Cập nhật thông tin câu hỏi</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nội dung câu hỏi *</Label>
              <Input
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="VD: Số năm kinh nghiệm làm việc?"
              />
            </div>

            <div className="space-y-2">
              <Label>Loại câu hỏi *</Label>
              <Select
                value={form.type}
                onValueChange={(val: QuestionType) =>
                  setForm((prev) => ({ ...prev, type: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((qt) => (
                    <SelectItem key={qt.value} value={qt.value}>
                      {qt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Placeholder (tùy chọn)</Label>
              <Input
                value={form.placeholder}
                onChange={(e) => setForm((prev) => ({ ...prev, placeholder: e.target.value }))}
                placeholder="VD: Nhập số năm..."
              />
            </div>

            {requiresOptions(form.type) && (
              <div className="space-y-2">
                <Label>Danh sách lựa chọn *</Label>
                <textarea
                  className="w-full min-h-24 px-3 py-2 border rounded-md"
                  value={form.optionsText}
                  onChange={(e) => setForm((prev) => ({ ...prev, optionsText: e.target.value }))}
                  placeholder="Mỗi lựa chọn 1 dòng hoặc phân tách bằng dấu phẩy"
                />
              </div>
            )}

            {requiresMinMax(form.type) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Giá trị min (tùy chọn)</Label>
                    <Input
                      type="number"
                      value={form.min ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Giá trị max (tùy chọn)</Label>
                    <Input
                      type="number"
                      value={form.max ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <Checkbox
                    id="isCurrency-edit"
                    checked={form.isCurrency}
                    onCheckedChange={(checked: boolean | 'indeterminate') =>
                      setForm((prev) => ({ ...prev, isCurrency: checked === true }))
                    }
                  />
                  <Label htmlFor="isCurrency-edit" className="cursor-pointer">
                    Định dạng tiền tệ VND (1.000.000)
                  </Label>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEdit} disabled={isBusy}>
              Hủy
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
