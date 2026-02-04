"use client";

import { useParams, useRouter } from "next/navigation";
import { useService } from "@/hooks/use-services";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, FileCheck, MessageSquare, GitBranch } from "lucide-react";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const { data: service, isLoading } = useService(serviceId);

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
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/services")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{service.name}</h1>
            <p className="text-muted-foreground mt-1">
              ID: {service.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {service.is_active ? (
            <Badge variant="default">Đang hoạt động</Badge>
          ) : (
            <Badge variant="secondary">Tạm dừng</Badge>
          )}
          <Button onClick={() => router.push(`/admin/services/${service.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Tên dịch vụ</p>
            <p className="font-medium">{service.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mô tả</p>
            <p className="font-medium">{service.description || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày tạo</p>
            <p className="font-medium">
              {new Date(service.created_at).toLocaleString("vi-VN")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Workflow */}
      {service.workflow && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <GitBranch className="h-5 w-5" />
            <div>
              <CardTitle>Workflow</CardTitle>
              <CardDescription>Quy trình xử lý hồ sơ cho dịch vụ này</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tên workflow</p>
              <p className="font-medium">{service.workflow.name}</p>
            </div>
            {service.workflow.stages && service.workflow.stages.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Các giai đoạn ({service.workflow.stages.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {service.workflow.stages
                    .sort((a, b) => a.stage_order - b.stage_order)
                    .map((stage) => (
                      <Badge
                        key={stage.id}
                        variant="outline"
                        style={{ borderColor: stage.color, color: stage.color }}
                      >
                        {stage.code}
                        {stage.triggers_commission && " 💰"}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document Requirements */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <FileCheck className="h-5 w-5" />
          <div>
            <CardTitle>Yêu cầu tài liệu</CardTitle>
            <CardDescription>
              Các loại tài liệu cần thiết khi tạo hồ sơ
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {service.documentRequirements && service.documentRequirements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Tên tài liệu</TableHead>
                  <TableHead className="text-center">Bắt buộc</TableHead>
                  <TableHead className="text-center">Max files</TableHead>
                  <TableHead>Allowed types</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {service.documentRequirements.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-mono text-xs">{doc.code}</TableCell>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell className="text-center">
                      {doc.isRequired ? (
                        <Badge variant="default">Bắt buộc</Badge>
                      ) : (
                        <Badge variant="secondary">Tùy chọn</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{doc.config?.maxFiles ?? 1}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {doc.config?.allowedTypes?.join(", ") || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Chưa có yêu cầu tài liệu nào
            </p>
          )}
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <div>
            <CardTitle>Câu hỏi bổ sung</CardTitle>
            <CardDescription>
              Thông tin bổ sung cần thu thập khi tạo hồ sơ
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {service.questions && service.questions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Câu hỏi</TableHead>
                  <TableHead className="text-center">Loại</TableHead>
                  <TableHead className="text-center">Bắt buộc</TableHead>
                  <TableHead className="text-center">Thứ tự</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {service.questions
                  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                  .map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.content}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{q.type}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {q.isRequired ? (
                          <Badge variant="default">Bắt buộc</Badge>
                        ) : (
                          <Badge variant="secondary">Tùy chọn</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{q.sortOrder ?? 0}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Chưa có câu hỏi bổ sung nào
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
