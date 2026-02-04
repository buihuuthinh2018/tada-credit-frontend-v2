"use client";

import { useState, use } from "react";
import { useAdminContractDetail, useAdminTransitionContract, useAdminContractTransitions } from "@/hooks/use-contracts";
import { useReviewDocument } from "@/hooks/use-documents";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  CreditCard,
  History,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { ContractDocument, ContractAnswer, ContractHistory } from "@/types";
import { DocumentFileViewer, FileCard } from "@/components/ui/document-file-viewer";
import { StageBadge } from "@/components/ui/stage-badge";

export default function AdminContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const contractId = resolvedParams.id;

  const { data: contract, isLoading, refetch } = useAdminContractDetail(contractId);
  const { data: availableTransitions } = useAdminContractTransitions(contractId);
  const transitionContract = useAdminTransitionContract();
  const reviewDocument = useReviewDocument();

  const [reviewingDoc, setReviewingDoc] = useState<ContractDocument | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [transitionNote, setTransitionNote] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Không tìm thấy hồ sơ</h2>
        <Link href="/admin/contracts">
          <Button className="mt-4">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const getDocStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "success" | "destructive"> = {
      PENDING: "secondary",
      APPROVED: "success",
      REJECTED: "destructive",
    };
    const labels: Record<string, string> = {
      PENDING: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      REJECTED: "Từ chối",
    };
    return <Badge variant={variants[status]}>{labels[status] || status}</Badge>;
  };

  const handleReviewDocument = (status: "APPROVED" | "REJECTED") => {
    if (!reviewingDoc) return;

    reviewDocument.mutate(
      {
        contractId: Number(contractId),
        documentId: Number(reviewingDoc.id),
        data: { status, note: reviewNote },
      },
      {
        onSuccess: () => {
          setReviewingDoc(null);
          setReviewNote("");
          refetch();
        },
      }
    );
  };

  const handleTransition = (toStageId: string) => {
    transitionContract.mutate(
      { id: contractId, toStageId, note: transitionNote || undefined },
      {
        onSuccess: () => {
          setTransitionDialogOpen(false);
          setTransitionNote("");
          refetch();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/contracts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Hồ sơ #{contract.id}</h1>
            <p className="text-gray-500">{contract.service?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {contract.stage && <StageBadge stage={contract.stage} variant="solid" />}
          {contract.stage?.code && !["COMPLETED", "CANCELLED", "REJECTED"].includes(contract.stage.code) && (
            <Dialog open={transitionDialogOpen} onOpenChange={setTransitionDialogOpen}>
              <DialogTrigger asChild>
                <Button>Chuyển trạng thái</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chuyển trạng thái hồ sơ</DialogTitle>
                  <DialogDescription>
                    Chọn trạng thái tiếp theo cho hồ sơ
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Ghi chú (tùy chọn)</Label>
                    <Textarea
                      value={transitionNote}
                      onChange={(e) => setTransitionNote(e.target.value)}
                      placeholder="Nhập ghi chú nếu cần..."
                    />
                  </div>
                  <div className="space-y-2">
                    {availableTransitions && availableTransitions.length > 0 ? (
                      availableTransitions.map((transition) => (
                        <Button
                          key={transition.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleTransition(transition.to_stage?.id || "")}
                          disabled={transitionContract.isPending}
                        >
                          <Clock className="w-4 h-4 mr-2 text-blue-500" />
                          {transition.name} → {transition.to_stage?.name}
                        </Button>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Không có transition nào khả dụng
                      </p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tài liệu
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="answers" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Câu trả lời
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu đã nộp</CardTitle>
              <CardDescription>
                Xem và duyệt các tài liệu của hồ sơ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contract.documents && contract.documents.length > 0 ? (
                <div className="space-y-6">
                  {contract.documents.map((doc: ContractDocument) => (
                    <div key={doc.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">
                            {doc.document_requirement?.name || "Tài liệu"}
                          </h3>
                          {doc.document_requirement?.description && (
                            <p className="text-sm text-gray-500">
                              {doc.document_requirement.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getDocStatusBadge(doc.status)}
                          {doc.status === "PENDING" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setReviewingDoc(doc)}
                                >
                                  Duyệt
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Duyệt tài liệu</DialogTitle>
                                  <DialogDescription>
                                    {doc.document_requirement?.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Ghi chú (tùy chọn)</Label>
                                    <Textarea
                                      value={reviewNote}
                                      onChange={(e) => setReviewNote(e.target.value)}
                                      placeholder="Nhập ghi chú nếu cần..."
                                    />
                                  </div>
                                </div>
                                <DialogFooter className="gap-2">
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleReviewDocument("REJECTED")}
                                    disabled={reviewDocument.isPending}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Từ chối
                                  </Button>
                                  <Button
                                    onClick={() => handleReviewDocument("APPROVED")}
                                    disabled={reviewDocument.isPending}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Phê duyệt
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>

                      {/* Review note */}
                      {doc.review_note && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">Ghi chú duyệt:</p>
                              <p className="text-sm text-yellow-700">{doc.review_note}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Files */}
                      {doc.files && doc.files.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {doc.files.map((file) => (
                            <FileCard
                              key={file.id}
                              fileId={file.id}
                              fileName={file.fileName || "document"}
                              mimeType={file.mimeType || "application/octet-stream"}
                              fileSize={file.fileSize || 0}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Chưa có file nào được tải lên
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Không có tài liệu nào
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Họ tên</dt>
                  <dd className="mt-1 text-sm">
                    {contract.user?.fullname}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm">{contract.user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Số điện thoại</dt>
                  <dd className="mt-1 text-sm">{contract.user?.phone || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ngày tạo hồ sơ</dt>
                  <dd className="mt-1 text-sm">
                    {new Date(contract.created_at).toLocaleString("vi-VN")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Answers Tab */}
        <TabsContent value="answers">
          <Card>
            <CardHeader>
              <CardTitle>Câu trả lời Questionnaire</CardTitle>
            </CardHeader>
            <CardContent>
              {contract.answers && contract.answers.length > 0 ? (
                <dl className="space-y-4">
                  {contract.answers.map((answer: ContractAnswer) => (
                    <div key={answer.id} className="border-b pb-4 last:border-0">
                      <dt className="text-sm font-medium text-gray-500">
                        {answer.question?.content || "Question"}
                      </dt>
                      <dd className="mt-1 text-sm">{answer.answer}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Chưa có câu trả lời nào
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử xử lý</CardTitle>
            </CardHeader>
            <CardContent>
              {contract.histories && contract.histories.length > 0 ? (
                <div className="space-y-4">
                  {contract.histories.map((history: ContractHistory) => (
                    <div key={history.id} className="flex items-start gap-4 border-l-2 pl-4 pb-4">
                      <div className="flex-1">
                        <p className="font-medium">
                          {history.fromStage?.name || "Bắt đầu"} → {history.toStage?.name}
                        </p>
                        {history.note && (
                          <p className="text-sm text-gray-500">
                            Ghi chú: {history.note}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(history.created_at).toLocaleString("vi-VN")}
                          {history.changedByUser && ` bởi ${history.changedByUser.fullname}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Chưa có lịch sử xử lý
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
