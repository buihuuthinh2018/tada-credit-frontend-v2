"use client";

import { useState, use, useEffect, useMemo } from "react";
import {
  useContract,
  useUpdateContractAnswers,
  useContractHistory,
  useSubmitContract,
} from "@/hooks/use-contracts";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  History,
  ArrowRight,
  ArrowLeft,
  X,
  Send,
  File,
} from "lucide-react";
import { DocumentRequirement } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { StageBadge } from "@/components/ui/stage-badge";

interface LocalFile {
  file: File;
  preview: string;
}

interface LocalDocumentFiles {
  [docReqId: string]: LocalFile[];
}

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const contractId = resolvedParams.id;

  const { data: contract, isLoading, refetch } = useContract(contractId);
  const { data: history } = useContractHistory(contractId);
  const updateAnswers = useUpdateContractAnswers();
  const submitContract = useSubmitContract();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [localFiles, setLocalFiles] = useState<LocalDocumentFiles>({});

  // Determine steps based on service config
  const steps = useMemo(() => {
    const s = [];
    const hasQuestions =
      contract?.service?.questions && contract.service.questions.length > 0;
    const hasDocuments =
      (contract?.service?.documentRequirements &&
        contract.service.documentRequirements.length > 0) ||
      (contract?.service?.documents && contract.service.documents.length > 0);

    if (hasQuestions) {
      s.push({ id: "questions", label: "Câu hỏi khảo sát", icon: FileText });
    }
    if (hasDocuments) {
      s.push({ id: "documents", label: "Tài liệu", icon: Upload });
    }
    s.push({ id: "review", label: "Xác nhận & Nộp", icon: Send });

    return s;
  }, [contract]);

  // Initialize answers from contract data
  useEffect(() => {
    if (contract?.answers) {
      const existingAnswers: Record<string, string> = {};
      contract.answers.forEach((a) => {
        existingAnswers[a.question_id] = a.answer;
      });
      setAnswers((prev) => ({ ...existingAnswers, ...prev }));
    }
  }, [contract?.answers]);

  // Cleanup previews when unmounting
  useEffect(() => {
    return () => {
      Object.values(localFiles)
        .flat()
        .forEach((f) => {
          URL.revokeObjectURL(f.preview);
        });
    };
  }, [localFiles]);

  // Get document requirements from either format
  const documentRequirements = useMemo((): Array<
    DocumentRequirement & { isRequired?: boolean }
  > => {
    if (contract?.service?.documentRequirements) {
      return contract.service.documentRequirements as Array<
        DocumentRequirement & { isRequired?: boolean }
      >;
    }
    if (contract?.service?.documents) {
      return (
        contract.service.documents as Array<{
          document_requirement?: DocumentRequirement;
          is_required?: boolean;
        }>
      ).map((d) => ({
        ...(d.document_requirement as DocumentRequirement),
        isRequired: d.is_required,
      }));
    }
    return [];
  }, [contract?.service]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold">Không tìm thấy hồ sơ</h2>
        <p className="text-gray-600 mt-2">
          Hồ sơ này không tồn tại hoặc bạn không có quyền truy cập
        </p>
        <Link href="/dashboard/contracts">
          <Button className="mt-4">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const isSubmitted = contract.stage?.code !== "DRAFT";

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFileSelect = (docReqId: string, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const docReq = documentRequirements.find((d) => d.id === docReqId);
    const maxFiles = docReq?.config?.maxFiles || 5;
    const currentCount = localFiles[docReqId]?.length || 0;

    const newFiles: LocalFile[] = [];
    for (
      let i = 0;
      i < fileList.length && currentCount + newFiles.length < maxFiles;
      i++
    ) {
      const file = fileList[i];
      newFiles.push({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "",
      });
    }

    setLocalFiles((prev) => ({
      ...prev,
      [docReqId]: [...(prev[docReqId] || []), ...newFiles],
    }));
  };

  const handleRemoveFile = (docReqId: string, index: number) => {
    setLocalFiles((prev) => {
      const files = [...(prev[docReqId] || [])];
      const removed = files.splice(index, 1);
      removed.forEach((f) => URL.revokeObjectURL(f.preview));
      return { ...prev, [docReqId]: files };
    });
  };

  const getStatusIcon = (stageCode?: string) => {
    switch (stageCode) {
      case "COMPLETED":
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "REJECTED":
      case "CANCELLED":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const renderQuestionInput = (question: {
    id: string;
    content: string;
    type: string;
    config?: {
      options?: string[];
      placeholder?: string;
      min?: number;
      max?: number;
    };
    isRequired: boolean;
  }) => {
    const currentValue = answers[question.id] ?? "";
    const questionType = (question.type || "text").toLowerCase();

    switch (questionType) {
      case "textarea":
        return (
          <Textarea
            value={currentValue}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.config?.placeholder || "Nhập câu trả lời..."}
            disabled={isSubmitted}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.config?.placeholder || "Nhập số..."}
            min={question.config?.min}
            max={question.config?.max}
            disabled={isSubmitted}
          />
        );
      case "date":
        return (
          <Input
            type="date"
            value={currentValue}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={isSubmitted}
          />
        );
      case "select":
        return (
          <Select
            value={currentValue}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            disabled={isSubmitted}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn một đáp án" />
            </SelectTrigger>
            <SelectContent>
              {question.config?.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            type="text"
            value={currentValue}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.config?.placeholder || "Nhập câu trả lời..."}
            disabled={isSubmitted}
          />
        );
    }
  };

  // Validate current step
  const validateStep = (stepId: string): boolean => {
    if (stepId === "questions") {
      const questions = contract.service?.questions || [];
      for (const q of questions as Array<{
        question?: { id: string; isRequired?: boolean };
        is_required?: boolean;
        id?: string;
        isRequired?: boolean;
      }>) {
        const question = q.question || q;
        const isRequired = q.is_required ?? question.isRequired ?? false;
        if (isRequired && !answers[question.id as string]) {
          return false;
        }
      }
      return true;
    }
    if (stepId === "documents") {
      for (const docReq of documentRequirements) {
        const isRequired = docReq.isRequired ?? true;
        const uploadedFiles =
          contract.documents?.find(
            (d) => d.document_requirement_id === docReq.id,
          )?.files || [];
        const localFilesCount = localFiles[docReq.id]?.length || 0;

        if (isRequired && uploadedFiles.length + localFilesCount === 0) {
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Prepare files map
    const filesMap: Record<string, File[]> = {};
    Object.entries(localFiles).forEach(([docReqId, files]) => {
      filesMap[docReqId] = files.map((f) => f.file);
    });

    // Prepare answers
    const answersArray = Object.entries(answers).map(
      ([questionId, answer]) => ({
        questionId,
        answer,
      }),
    );

    submitContract.mutate(
      {
        contractId,
        answers: answersArray,
        files: filesMap,
      },
      {
        onSuccess: () => {
          // Clear local files
          setLocalFiles({});
          refetch();
        },
      },
    );
  };

  // Progress percentage
  const progress = ((currentStep + 1) / steps.length) * 100;

  // If already submitted, show read-only view
  if (isSubmitted) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Hồ sơ {contract.contract_number || `#${contract.id.slice(0, 8)}`}
            </h1>
            <p className="text-gray-600">{contract.service?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <StageBadge stage={contract.stage} variant="solid" />
          </div>
        </div>

        {/* Contract Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin hồ sơ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Dịch vụ</p>
                <p className="font-medium">{contract.service?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p className="font-medium">
                  {new Date(contract.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <p className="font-medium">{contract.stage?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày nộp</p>
                <p className="font-medium">
                  {contract.submitted_at
                    ? new Date(contract.submitted_at).toLocaleDateString(
                        "vi-VN",
                      )
                    : "Chưa nộp"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answers */}
        {contract.answers && contract.answers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Câu trả lời</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.answers.map((a) => (
                <div key={a.id} className="border-b pb-3 last:border-0">
                  <p className="text-sm text-gray-500">{a.question?.content}</p>
                  <p className="font-medium">{a.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {contract.documents && contract.documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu đã nộp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {doc.document_requirement?.name}
                    </h4>
                    <Badge
                      variant={
                        doc.status === "APPROVED"
                          ? "success"
                          : doc.status === "REJECTED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {doc.status === "APPROVED"
                        ? "Đã duyệt"
                        : doc.status === "REJECTED"
                          ? "Từ chối"
                          : "Chờ duyệt"}
                    </Badge>
                  </div>
                  {doc.review_note && (
                    <p className="text-sm text-orange-600 mb-2">
                      Ghi chú: {doc.review_note}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {doc.files?.map((file: { id: string; file_name?: string; file_url?: string }) => (
                      <div
                        key={file.id}
                        className="text-sm flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg"
                      >
                        <File className="w-4 h-4" />
                        {file.file_name || "Tài liệu"}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* History */}
        {history && history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Lịch sử xử lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 relative"
                  >
                    {index !== history.length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200" />
                    )}
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center z-10">
                      <History className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {item.transition?.name || "Khởi tạo"}
                        </span>
                        {item.toStage && (
                          <Badge variant="secondary">{item.toStage.name}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Wizard view for DRAFT status
  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hoàn thành hồ sơ</h1>
          <p className="text-gray-600">{contract.service?.name}</p>
        </div>
        <Link href="/dashboard/contracts">
          <Button variant="ghost">
            <X className="w-4 h-4 mr-2" />
            Đóng
          </Button>
        </Link>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tiến độ</span>
          <span>
            {currentStep + 1}/{steps.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 text-sm ${
                index <= currentStep ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <step.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStepData && <currentStepData.icon className="w-5 h-5" />}
            {currentStepData?.label}
          </CardTitle>
          <CardDescription>
            {currentStepData?.id === "questions" &&
              "Trả lời các câu hỏi dưới đây"}
            {currentStepData?.id === "documents" &&
              "Upload các tài liệu cần thiết"}
            {currentStepData?.id === "review" &&
              "Kiểm tra thông tin và nộp hồ sơ"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Questions Step */}
          {currentStepData?.id === "questions" && (
            <div className="space-y-6">
              {contract.service?.questions
                ?.sort(
                  (
                    a: { sort_order?: number; order?: number },
                    b: { sort_order?: number; order?: number },
                  ) =>
                    (a.sort_order ?? a.order ?? 0) -
                    (b.sort_order ?? b.order ?? 0),
                )
                .map(
                  (q: {
                    question?: {
                      id: string;
                      content?: string;
                      type?: string;
                      config?: Record<string, unknown>;
                      isRequired?: boolean;
                    };
                    is_required?: boolean;
                    id?: string;
                    content?: string;
                    type?: string;
                    config?: Record<string, unknown>;
                    isRequired?: boolean;
                  }) => {
                    const question = q.question || q;
                    const isRequired =
                      q.is_required ?? question.isRequired ?? false;
                    return (
                      <div key={question.id} className="space-y-2">
                        <Label>
                          {question.content}
                          {isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        {renderQuestionInput({
                          id: question.id!,
                          content: question.content || "",
                          type: question.type || "text",
                          config: question.config as
                            | {
                                options?: string[];
                                placeholder?: string;
                                min?: number;
                                max?: number;
                              }
                            | undefined,
                          isRequired,
                        })}
                      </div>
                    );
                  },
                )}
            </div>
          )}

          {/* Documents Step */}
          {currentStepData?.id === "documents" && (
            <div className="space-y-6">
              {documentRequirements.map(
                (docReq: DocumentRequirement & { isRequired?: boolean }) => {
                  const uploadedFiles =
                    contract.documents?.find(
                      (d) => d.document_requirement_id === docReq.id,
                    )?.files || [];
                  const pendingFiles = localFiles[docReq.id] || [];
                  const maxFiles = docReq.config?.maxFiles || 5;
                  const canAddMore =
                    uploadedFiles.length + pendingFiles.length < maxFiles;

                  return (
                    <div
                      key={docReq.id}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {docReq.name}
                          {docReq.isRequired && (
                            <span className="text-red-500">*</span>
                          )}
                        </h3>
                        {docReq.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {docReq.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Tối đa {maxFiles} file. Định dạng:{" "}
                          {docReq.config?.allowedTypes?.join(", ") || "Tất cả"}
                        </p>
                      </div>

                      {/* Already uploaded files */}
                      {uploadedFiles.length > 0 && (
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm font-medium text-green-700 mb-2">
                            Đã upload ({uploadedFiles.length} file):
                          </p>
                          <ul className="text-sm text-green-600 space-y-1">
                            {uploadedFiles.map((file) => (
                              <li
                                key={file.id}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {file.file_name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Pending files preview */}
                      {pendingFiles.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {pendingFiles.map((f, idx) => (
                            <div
                              key={idx}
                              className="relative border rounded-lg p-2 bg-gray-50"
                            >
                              {f.preview ? (
                                <div className="relative aspect-square mb-2">
                                  <Image
                                    src={f.preview}
                                    alt={f.file.name}
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-square mb-2 flex items-center justify-center bg-gray-100 rounded">
                                  <File className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              <p className="text-xs truncate">{f.file.name}</p>
                              <button
                                title="remove file"
                                onClick={() => handleRemoveFile(docReq.id, idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload input */}
                      {canAddMore && (
                        <div className="space-y-2">
                          <Input
                            type="file"
                            multiple={maxFiles > 1}
                            accept={docReq.config?.allowedTypes?.join(",")}
                            onChange={(e) =>
                              handleFileSelect(docReq.id, e.target.files)
                            }
                            className="cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          )}

          {/* Review Step */}
          {currentStepData?.id === "review" && (
            <div className="space-y-6">
              {/* Answers Summary */}
              {Object.keys(answers).length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Câu trả lời
                  </h4>
                  <dl className="space-y-2">
                    {contract.service?.questions?.map(
                      (q: {
                        question?: { id: string; content?: string };
                        id?: string;
                        content?: string;
                      }) => {
                        const question = q.question || q;
                        const answer = answers[question.id!];
                        if (!answer) return null;
                        return (
                          <div key={question.id} className="text-sm">
                            <dt className="text-gray-500">
                              {question.content}
                            </dt>
                            <dd className="font-medium">{answer}</dd>
                          </div>
                        );
                      },
                    )}
                  </dl>
                </div>
              )}

              {/* Documents Summary */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Tài liệu
                </h4>
                <ul className="space-y-2">
                  {documentRequirements.map((docReq: DocumentRequirement) => {
                    const uploadedFiles =
                      contract.documents?.find(
                        (d) => d.document_requirement_id === docReq.id,
                      )?.files || [];
                    const pendingFiles = localFiles[docReq.id] || [];
                    const totalFiles =
                      uploadedFiles.length + pendingFiles.length;

                    return (
                      <li
                        key={docReq.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{docReq.name}</span>
                        <Badge
                          variant={totalFiles > 0 ? "success" : "secondary"}
                        >
                          {totalFiles > 0 ? `${totalFiles} file` : "Chưa có"}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Lưu ý:</strong> Sau khi nộp hồ sơ, bạn sẽ không thể
                  chỉnh sửa thông tin. Vui lòng kiểm tra kỹ trước khi nộp.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!validateStep(currentStepData?.id || "")}
          >
            Tiếp tục
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitContract.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitContract.isPending ? (
              "Đang nộp..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Nộp hồ sơ
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
