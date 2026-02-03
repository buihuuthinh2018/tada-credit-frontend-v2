"use client";

import { useState, use } from "react";
import {
  useContract,
  useUpdateContractAnswers,
  useUploadContractDocument,
  useContractHistory,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { ContractStatus, QuestionType } from "@/types";
import Link from "next/link";

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const contractId = parseInt(resolvedParams.id);

  const { data: contract, isLoading } = useContract(contractId);
  const { data: history } = useContractHistory(contractId);
  const updateAnswers = useUpdateContractAnswers();
  const uploadDocument = useUploadContractDocument();

  const [answers, setAnswers] = useState<Record<number, string>>({});

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

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSaveAnswers = () => {
    const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId),
      answer,
    }));

    if (answersArray.length > 0) {
      updateAnswers.mutate({ id: contractId, answers: answersArray });
    }
  };

  const handleFileUpload = (
    docReqId: number,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    uploadDocument.mutate({
      contractId,
      docReqId,
      files,
    });
  };

  const getStatusIcon = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case ContractStatus.REJECTED:
      case ContractStatus.CANCELLED:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const renderQuestionInput = (question: {
    id: number;
    questionText: string;
    questionType: QuestionType;
    options: string[] | null;
    isRequired: boolean;
  }) => {
    const existingAnswer = contract.answers?.find(
      (a) => a.questionId === question.id
    );
    const currentValue = answers[question.id] ?? existingAnswer?.answer ?? "";

    switch (question.questionType) {
      case "TEXTAREA":
        return (
          <Textarea
            value={currentValue}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Nhập câu trả lời..."
          />
        );
      case "NUMBER":
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Nhập số..."
          />
        );
      case "DATE":
        return (
          <Input
            type="date"
            value={currentValue}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );
      case "SELECT":
        return (
          <Select
            value={currentValue}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn một đáp án" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
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
            placeholder="Nhập câu trả lời..."
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hồ sơ #{contract.id}</h1>
          <p className="text-gray-600">{contract.service?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(contract.status)}
          <Badge
            variant={
              contract.status === ContractStatus.COMPLETED
                ? "success"
                : contract.status === ContractStatus.REJECTED
                ? "destructive"
                : "secondary"
            }
          >
            {contract.currentStage?.name || contract.status}
          </Badge>
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
                {new Date(contract.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trạng thái</p>
              <p className="font-medium">{contract.currentStage?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Workflow</p>
              <p className="font-medium">{contract.workflow?.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Câu hỏi khảo sát</TabsTrigger>
          <TabsTrigger value="documents">Tài liệu</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Câu hỏi khảo sát</CardTitle>
              <CardDescription>
                Trả lời các câu hỏi dưới đây để hoàn thành hồ sơ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {contract.service?.questions &&
              contract.service.questions.length > 0 ? (
                <>
                  {contract.service.questions
                    .sort((a, b) => a.order - b.order)
                    .map((question) => (
                      <div key={question.id} className="space-y-2">
                        <Label>
                          {question.questionText}
                          {question.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        {renderQuestionInput(question)}
                      </div>
                    ))}
                  <Button
                    onClick={handleSaveAnswers}
                    disabled={
                      updateAnswers.isPending || Object.keys(answers).length === 0
                    }
                  >
                    {updateAnswers.isPending ? "Đang lưu..." : "Lưu câu trả lời"}
                  </Button>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Không có câu hỏi nào cho dịch vụ này
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu yêu cầu</CardTitle>
              <CardDescription>
                Upload các tài liệu cần thiết cho hồ sơ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {contract.service?.documentRequirements &&
              contract.service.documentRequirements.length > 0 ? (
                contract.service.documentRequirements.map((docReq) => {
                  const uploaded = contract.documents?.find(
                    (d) => d.documentRequirementId === docReq.id
                  );

                  return (
                    <div
                      key={docReq.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {docReq.name}
                            {docReq.isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </h3>
                          {docReq.description && (
                            <p className="text-sm text-gray-500">
                              {docReq.description}
                            </p>
                          )}
                        </div>
                        {uploaded && (
                          <Badge
                            variant={
                              uploaded.status === "APPROVED"
                                ? "success"
                                : uploaded.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {uploaded.status === "APPROVED"
                              ? "Đã duyệt"
                              : uploaded.status === "REJECTED"
                              ? "Từ chối"
                              : "Chờ duyệt"}
                          </Badge>
                        )}
                      </div>

                      {uploaded && uploaded.files && uploaded.files.length > 0 ? (
                        <div className="bg-green-50 p-3 rounded">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span>Đã upload {uploaded.files.length} file(s)</span>
                          </div>
                          <ul className="mt-2 text-sm">
                            {uploaded.files.map((file) => (
                              <li key={file.id}>{file.fileName}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            type="file"
                            multiple={docReq.maxFiles > 1}
                            accept={docReq.allowedFormats?.join(",")}
                            onChange={(e) =>
                              handleFileUpload(docReq.id, e.target.files)
                            }
                            disabled={uploadDocument.isPending}
                          />
                          <p className="text-xs text-gray-500">
                            Tối đa {docReq.maxFiles} file. Định dạng:{" "}
                            {docReq.allowedFormats?.join(", ") || "Tất cả"}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Không có tài liệu nào yêu cầu cho dịch vụ này
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thay đổi</CardTitle>
              <CardDescription>
                Theo dõi các thay đổi trạng thái của hồ sơ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history && history.length > 0 ? (
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
                          <Badge variant="secondary">
                            {item.toStage?.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleString("vi-VN")}
                          {item.changedByUser && (
                            <span>
                              {" "}
                              bởi {item.changedByUser.firstName}{" "}
                              {item.changedByUser.lastName}
                            </span>
                          )}
                        </p>
                        {item.note && (
                          <p className="text-sm mt-1 text-gray-600">
                            Ghi chú: {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Chưa có lịch sử thay đổi
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
