# 42 - Contract Application Flow

## 🎯 Overview

Hướng dẫn build flow nộp hồ sơ/hợp đồng vay hoàn chỉnh.

---

## Contract Application Steps

1. **Chọn dịch vụ** (Service)
2. **Tạo hồ sơ** (Create Contract)
3. **Trả lời câu hỏi** (Fill Questionnaire)
4. **Upload tài liệu** (Upload Documents)
5. **Gửi hồ sơ** (Submit)
6. **Theo dõi trạng thái** (Track Status)

---

## 1. Contract Hooks

### `hooks/use-contracts.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Contract, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: number) => {
      const { data } = await apiClient.post('/contracts', { serviceId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Tạo hồ sơ thành công!');
    },
  });
}

export function useContracts(params?: any) {
  return useQuery<PaginatedResponse<Contract>>({
    queryKey: ['contracts', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/contracts', { params });
      return data;
    },
  });
}

export function useContract(id: number) {
  return useQuery<Contract>({
    queryKey: ['contracts', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/contracts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateContractAnswers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, answers }: { id: number; answers: any[] }) => {
      const { data } = await apiClient.put(`/contracts/${id}/answers`, { answers });
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', id] });
      toast.success('Lưu câu trả lời thành công!');
    },
  });
}

export function useUploadContractDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      contractId, 
      docReqId, 
      files 
    }: { 
      contractId: number; 
      docReqId: number; 
      files: FileList;
    }) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const { data } = await apiClient.post(
        `/contracts/${contractId}/documents/${docReqId}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data;
    },
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
      toast.success('Upload tài liệu thành công!');
    },
  });
}
```

---

## 2. Service Selection Page

### `app/dashboard/contracts/new/page.tsx`

```typescript
'use client';

import { useServices } from '@/hooks/use-services';
import { useCreateContract } from '@/hooks/use-contracts';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chọn dịch vụ</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services?.map((service) => (
          <Card key={service.id} className="p-6">
            <h2 className="text-xl font-bold mb-2">{service.name}</h2>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <Button onClick={() => handleSelectService(service.id)}>
              Chọn dịch vụ này
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. Contract Detail Page (Questionnaire + Documents)

### `app/dashboard/contracts/[id]/page.tsx`

```typescript
'use client';

import { useContract, useUpdateContractAnswers, useUploadContractDocument } from '@/hooks/use-contracts';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const contractId = parseInt(params.id);
  const { data: contract, isLoading } = useContract(contractId);
  const updateAnswers = useUpdateContractAnswers();
  const uploadDocument = useUploadContractDocument();

  const [answers, setAnswers] = useState<Record<number, string>>({});

  if (isLoading) return <div>Loading...</div>;
  if (!contract) return <div>Contract not found</div>;

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSaveAnswers = () => {
    const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId),
      answer,
    }));

    updateAnswers.mutate({ id: contractId, answers: answersArray });
  };

  const handleFileUpload = (docReqId: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    uploadDocument.mutate({
      contractId,
      docReqId,
      files,
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Hồ sơ #{contract.id}</h1>

      {/* Service Info */}
      <div className="bg-blue-50 p-4 rounded">
        <h2 className="font-bold">Dịch vụ: {contract.service?.name}</h2>
        <p className="text-sm text-gray-600">{contract.service?.description}</p>
      </div>

      {/* Questionnaire */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Trả lời câu hỏi</h2>

        {contract.service?.questions?.map((question) => {
          const existingAnswer = contract.answers?.find(a => a.questionId === question.id);

          return (
            <div key={question.id} className="space-y-2">
              <Label>
                {question.questionText}
                {question.isRequired && <span className="text-red-500">*</span>}
              </Label>

              {question.questionType === 'TEXTAREA' ? (
                <Textarea
                  defaultValue={existingAnswer?.answer || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
              ) : (
                <Input
                  type={question.questionType === 'NUMBER' ? 'number' : 'text'}
                  defaultValue={existingAnswer?.answer || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
              )}
            </div>
          );
        })}

        <Button onClick={handleSaveAnswers} disabled={updateAnswers.isPending}>
          {updateAnswers.isPending ? 'Đang lưu...' : 'Lưu câu trả lời'}
        </Button>
      </div>

      {/* Documents */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Upload tài liệu</h2>

        {contract.service?.documentRequirements?.map((docReq) => {
          const uploaded = contract.documents?.find(d => d.documentRequirementId === docReq.id);

          return (
            <div key={docReq.id} className="border p-4 rounded">
              <h3 className="font-bold">
                {docReq.name}
                {docReq.isRequired && <span className="text-red-500">*</span>}
              </h3>
              <p className="text-sm text-gray-600">{docReq.description}</p>

              {uploaded ? (
                <div className="mt-2 text-green-600">
                  ✓ Đã upload {uploaded.files?.length || 0} file(s)
                </div>
              ) : (
                <Input
                  type="file"
                  multiple={docReq.maxFiles > 1}
                  accept={docReq.allowedFormats?.join(',')}
                  onChange={(e) => handleFileUpload(docReq.id, e.target.files)}
                  className="mt-2"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## ✅ Complete Flow Checklist

- ✅ Chọn dịch vụ
- ✅ Tạo hồ sơ
- ✅ Trả lời câu hỏi
- ✅ Upload tài liệu
- ✅ Submit hồ sơ
- ✅ Theo dõi trạng thái workflow
- ✅ Xem lịch sử thay đổi

---

## 🔗 Next Steps

1. ✅ Build Admin panel để duyệt hồ sơ
2. ✅ Implement workflow transitions
3. ✅ Add document review system
