"use client";

import { useState, useEffect } from "react";
import { useServices } from "@/hooks/use-services";
import { useCreateContract } from "@/hooks/use-contracts";
import { useSearchUsers } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import { formatVND } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileBox, ArrowRight, FileText, CheckCircle, Users, User, Search, Loader2, Eye, Info } from "lucide-react";
import { User as UserType } from "@/types";

export default function NewContractPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: services, isLoading } = useServices();
  const createContract = useCreateContract();

  // State for CTV flow
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [showTargetDialog, setShowTargetDialog] = useState(false);
  const [targetType, setTargetType] = useState<"self" | "other">("self");
  const [targetUserId, setTargetUserId] = useState("");
  
  // State for viewing service details
  const [viewServiceId, setViewServiceId] = useState<string | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  // Search user state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  
  // Requested loan amount
  const [requestedAmount, setRequestedAmount] = useState<number>(0);
  const [amountError, setAmountError] = useState<string>("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search users hook
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(debouncedSearch);

  // Check if user has CTV role
  const isCTV = user?.roles?.some((r) => r.code === "CTV");
  
  // Get selected service details
  const selectedService = services?.find((s) => s.id === selectedServiceId);
  const viewService = services?.find((s) => s.id === viewServiceId);
  const minLoan = selectedService?.min_loan_amount ?? 1000000;
  const maxLoan = selectedService?.max_loan_amount ?? 100000000;

  // Validate requested amount
  const validateAmount = (amount: number): string => {
    if (amount < minLoan) {
      return `Số tiền tối thiểu là ${formatVND(minLoan)}`;
    }
    if (amount > maxLoan) {
      return `Số tiền tối đa là ${formatVND(maxLoan)}`;
    }
    return "";
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseInt(value.replace(/[^\d]/g, '')) || 0;
    setRequestedAmount(numValue);
    setAmountError(validateAmount(numValue));
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services?.find((s) => s.id === serviceId);
    const defaultAmount = service?.min_loan_amount ?? 1000000;
    setRequestedAmount(defaultAmount);
    setAmountError("");
    setShowTargetDialog(true);
  };

  const handleViewService = (serviceId: string) => {
    setViewServiceId(serviceId);
    setShowDetailDialog(true);
  };

  const resetDetailDialog = () => {
    setShowDetailDialog(false);
    setViewServiceId(null);
  };

  const handleSelectUser = (searchUser: UserType) => {
    setSelectedUser(searchUser);
    setTargetUserId(searchUser.id);
    setSearchQuery(""); // Clear search after selection
  };

  const handleConfirmCreate = () => {
    if (!selectedServiceId) return;
    
    // Validate amount before submitting
    const error = validateAmount(requestedAmount);
    if (error) {
      setAmountError(error);
      return;
    }

    const request = targetType === "other" && targetUserId
      ? { serviceId: selectedServiceId, requestedAmount, targetUserId }
      : { serviceId: selectedServiceId, requestedAmount };

    createContract.mutate(request, {
      onSuccess: (contract) => {
        resetDialog();
        router.push(`/dashboard/contracts/${contract.id}`);
      },
    });
  };

  const resetDialog = () => {
    setShowTargetDialog(false);
    setSelectedServiceId(null);
    setTargetType("self");
    setTargetUserId("");
    setSelectedUser(null);
    setSearchQuery("");
    setRequestedAmount(0);
    setAmountError("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chọn dịch vụ</h1>
        <p className="text-gray-600">
          {isCTV 
            ? "Chọn dịch vụ để tạo hồ sơ cho mình hoặc cho khách hàng" 
            : "Chọn dịch vụ bạn muốn đăng ký"}
        </p>
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
            .filter((s) => s.is_active)
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
                      {/* Loan Limits */}
                      <div className="p-2 bg-blue-50 rounded text-blue-700">
                        <span className="font-medium">Giới hạn vay: </span>
                        {formatVND(service.min_loan_amount ?? 1000000, false)} - {formatVND(service.max_loan_amount ?? 100000000)}
                      </div>
                      {service.documents && service.documents.length > 0 && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{service.documents.length} tài liệu yêu cầu</span>
                        </div>
                      )}
                      {service.questions && service.questions.length > 0 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>{service.questions.length} câu hỏi khảo sát</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewService(service.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleSelectService(service.id)}
                        disabled={createContract.isPending}
                      >
                        {createContract.isPending ? (
                          "Đang tạo..."
                        ) : (
                          <>
                            {isCTV ? "Tạo hồ sơ" : "Đăng ký ngay"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
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

      {/* Service Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={(open) => !open && resetDetailDialog()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              {viewService?.name}
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về gói vay
            </DialogDescription>
          </DialogHeader>

          {viewService && (
            <div className="space-y-6 py-4">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {viewService.description}
                </p>
              </div>

              {/* Loan Amount Range */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Giới hạn vay</h3>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">
                    {formatVND(viewService.min_loan_amount ?? 1000000, false)} - {formatVND(viewService.max_loan_amount ?? 100000000)}
                  </p>
                </div>
              </div>

              {/* Required Documents */}
              {viewService.documents && viewService.documents.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Tài liệu cần thiết ({viewService.documents.length})
                  </h3>
                  <div className="space-y-2">
                    {viewService.documents.map((doc, idx) => (
                      <div
                        key={doc.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {doc.document_requirement.name}
                            {doc.is_required && (
                              <span className="ml-2 text-xs text-red-500">*</span>
                            )}
                          </p>
                          {doc.document_requirement.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {doc.document_requirement.description}
                            </p>
                          )}
                          {doc.document_requirement.file_type && (
                            <p className="text-xs text-gray-500 mt-1">
                              Định dạng: {doc.document_requirement.file_type}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Survey Questions */}
              {viewService.questions && viewService.questions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    Câu hỏi khảo sát ({viewService.questions.length})
                  </h3>
                  <div className="space-y-2">
                    {viewService.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {q.content}
                            {q.isRequired && (
                              <span className="ml-2 text-xs text-red-500">*</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Loại: {q.type === 'text' ? 'Văn bản' : q.type === 'select' ? 'Một lựa chọn' : q.type === 'multiselect' ? 'Nhiều lựa chọn' : q.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Configurations */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Cấu hình khác</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <Badge variant={viewService.is_active ? "success" : "secondary"} className="mt-1">
                      {viewService.is_active ? "Đang hoạt động" : "Tạm dừng"}
                    </Badge>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600">Hoa hồng</p>
                    <Badge variant={viewService.commission_enabled ? "success" : "secondary"} className="mt-1">
                      {viewService.commission_enabled ? "Có" : "Không"}
                    </Badge>
                  </div>
                  {viewService.workflow && (
                    <div className="p-3 bg-gray-50 rounded-lg border sm:col-span-2">
                      <p className="text-sm text-gray-600">Quy trình</p>
                      <p className="font-medium text-gray-900 mt-1">{viewService.workflow.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={resetDetailDialog}>
              Đóng
            </Button>
            {viewService && (
              <Button onClick={() => {
                resetDetailDialog();
                handleSelectService(viewService.id);
              }}>
                Đăng ký ngay
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CTV Target Selection Dialog */}
      <Dialog open={showTargetDialog} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo hồ sơ mới</DialogTitle>
            <DialogDescription>
              {selectedService?.name} - Nhập thông tin hồ sơ
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Requested Loan Amount */}
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
              <Label htmlFor="requestedAmount" className="text-blue-800 font-medium">
                Nhu cầu vay (VND) *
              </Label>
              <Input
                id="requestedAmount"
                type="text"
                value={formatVND(requestedAmount, false)}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Nhập số tiền cần vay"
                className={amountError ? "border-red-500" : ""}
              />
              {amountError ? (
                <p className="text-xs text-red-500">{amountError}</p>
              ) : (
                <p className="text-xs text-blue-600">
                  Giới hạn: {formatVND(minLoan, false)} - {formatVND(maxLoan)}
                </p>
              )}
            </div>

            {/* CTV-specific: Target selection */}
            {isCTV && (
              <>
              <RadioGroup
                value={targetType}
                onValueChange={(value: "self" | "other") => {
                  setTargetType(value);
                  if (value === "self") {
                    setSelectedUser(null);
                    setTargetUserId("");
                    setSearchQuery("");
                  }
              }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="self" id="self" />
                <Label htmlFor="self" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Cho bản thân</p>
                      <p className="text-sm text-gray-500">Tạo hồ sơ cho chính bạn</p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Cho khách hàng</p>
                      <p className="text-sm text-gray-500">Tạo hồ sơ thay cho người khác</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            </>
            )}

            {isCTV && targetType === "other" && (
              <div className="space-y-3 pt-2">
                {/* Selected User Display */}
                {selectedUser ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">{selectedUser.fullname}</p>
                        <p className="text-sm text-green-600">{selectedUser.email}</p>
                        {selectedUser.phone && (
                          <p className="text-sm text-green-600">{selectedUser.phone}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(null);
                          setTargetUserId("");
                        }}
                      >
                        Đổi
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Search Input */}
                    <div className="space-y-2">
                      <Label>Tìm khách hàng</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Nhập email, SĐT hoặc tên..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                        {isSearching && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Nhập ít nhất 3 ký tự để tìm kiếm
                      </p>
                    </div>

                    {/* Search Results */}
                    {searchResults?.data && searchResults.data.length > 0 && (
                      <div className="border rounded-lg max-h-48 overflow-y-auto">
                        {searchResults.data.map((u) => (
                          <div
                            key={u.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleSelectUser(u)}
                          >
                            <p className="font-medium">{u.fullname}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                            {u.phone && (
                              <p className="text-sm text-gray-400">{u.phone}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {debouncedSearch.length >= 3 && !isSearching && (!searchResults?.data || searchResults.data.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        Không tìm thấy khách hàng
                      </p>
                    )}

                    {/* Manual UUID Input (fallback) */}
                    <div className="space-y-2 pt-2 border-t">
                      <Label htmlFor="targetUserId" className="text-gray-500">
                        Hoặc nhập trực tiếp User ID
                      </Label>
                      <Input
                        id="targetUserId"
                        placeholder="Nhập User ID (UUID)"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmCreate}
              disabled={createContract.isPending || !!amountError || (isCTV && targetType === "other" && !targetUserId)}
            >
              {createContract.isPending ? "Đang tạo..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
