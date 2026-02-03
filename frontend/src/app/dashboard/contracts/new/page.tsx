"use client";

import { useServices } from "@/hooks/use-services";
import { useCreateContract } from "@/hooks/use-contracts";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FileBox, ArrowRight, FileText, CheckCircle } from "lucide-react";

export default function NewContractPage() {
  const router = useRouter();
  const { data: services, isLoading } = useServices();
  const createContract = useCreateContract();

  const handleSelectService = (serviceId: number) => {
    createContract.mutate(serviceId, {
      onSuccess: (contract) => {
        router.push(`/dashboard/contracts/${contract.id}`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chọn dịch vụ</h1>
        <p className="text-gray-600">Chọn dịch vụ bạn muốn đăng ký</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services
            .filter((s) => s.isActive)
            .map((service) => (
              <Card
                key={service.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <FileBox className="w-8 h-8 text-blue-500" />
                    <Badge variant="success">Đang mở</Badge>
                  </div>
                  <CardTitle className="mt-4">{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Service Info */}
                    <div className="text-sm text-gray-600 space-y-2">
                      {service.documentRequirements &&
                        service.documentRequirements.length > 0 && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>
                              {service.documentRequirements.length} tài liệu yêu
                              cầu
                            </span>
                          </div>
                        )}
                      {service.questions && service.questions.length > 0 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>{service.questions.length} câu hỏi khảo sát</span>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleSelectService(service.id)}
                      disabled={createContract.isPending}
                    >
                      {createContract.isPending ? (
                        "Đang tạo..."
                      ) : (
                        <>
                          Đăng ký ngay
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileBox className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-600">
              Chưa có dịch vụ nào
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Vui lòng quay lại sau hoặc liên hệ với quản trị viên
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
