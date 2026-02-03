# 05 - TypeScript Types & Interfaces

Copy tất cả types này vào project NextJS của bạn.

---

## Core Types

### `types/api.ts`

```typescript
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
```

---

## Auth Types

### `types/auth.ts`

```typescript
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isVerified: boolean;
  isActive: boolean;
  referralCode: string;
  referrerId: number | null;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
  permissions?: string[];
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  resource: string;
  action: string;
  description: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  referralCode?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}
```

---

## Wallet Types

### `types/wallet.ts`

```typescript
export interface Wallet {
  id: number;
  userId: number;
  balance: string; // Decimal as string
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: number;
  walletId: number;
  transactionId: number;
  entryType: 'DEBIT' | 'CREDIT';
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  metadata: any;
  createdAt: string;
}

export interface WalletTransaction extends LedgerEntry {
  wallet?: Wallet;
}

export interface WalletBalance {
  balance: string;
}
```

---

## Withdrawal Types

### `types/withdrawal.ts`

```typescript
export enum WithdrawalStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface Withdrawal {
  id: number;
  userId: number;
  walletId: number;
  amount: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  status: WithdrawalStatus;
  note: string | null;
  processedBy: number | null;
  processedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface CreateWithdrawalRequest {
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  note?: string;
}

export interface ProcessWithdrawalRequest {
  action: 'APPROVE' | 'REJECT';
  note?: string;
}
```

---

## Contract Types

### `types/contract.ts`

```typescript
export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export interface Contract {
  id: number;
  userId: number;
  serviceId: number;
  workflowId: number;
  currentStageId: number;
  referrerId: number | null;
  status: ContractStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  
  user?: User;
  service?: Service;
  workflow?: Workflow;
  currentStage?: WorkflowStage;
  referrer?: User;
  documents?: ContractDocument[];
  answers?: ContractAnswer[];
}

export interface CreateContractRequest {
  serviceId: number;
}

export interface ContractAnswer {
  id: number;
  contractId: number;
  questionId: number;
  answer: string;
  createdAt: string;
  updatedAt: string;
  question?: Question;
}

export interface UpdateContractAnswersRequest {
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}

export interface ContractTransitionRequest {
  transitionId: number;
  note?: string;
}
```

---

## Service Types

### `types/service.ts`

```typescript
export interface Service {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  documentRequirements?: DocumentRequirement[];
  questions?: Question[];
}

export interface CreateServiceRequest {
  name: string;
  description: string;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}
```

---

## Document Types

### `types/document.ts`

```typescript
export interface DocumentRequirement {
  id: number;
  name: string;
  description: string | null;
  isRequired: boolean;
  maxFiles: number;
  allowedFormats: string[];
  maxSizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContractDocument {
  id: number;
  contractId: number;
  documentRequirementId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy: number | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  
  documentRequirement?: DocumentRequirement;
  files?: DocumentFile[];
}

export interface DocumentFile {
  id: number;
  contractDocumentId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ReviewDocumentRequest {
  status: 'APPROVED' | 'REJECTED';
  note?: string;
}
```

---

## Question Types

### `types/question.ts`

```typescript
export interface Question {
  id: number;
  questionText: string;
  questionType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'TEXTAREA';
  options: string[] | null;
  isRequired: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  questionText: string;
  questionType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'TEXTAREA';
  options?: string[];
  isRequired: boolean;
  order: number;
}

export interface UpdateQuestionRequest {
  questionText?: string;
  questionType?: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'TEXTAREA';
  options?: string[];
  isRequired?: boolean;
  order?: number;
}
```

---

## Workflow Types

### `types/workflow.ts`

```typescript
export interface Workflow {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stages?: WorkflowStage[];
  transitions?: WorkflowTransition[];
}

export interface WorkflowStage {
  id: number;
  workflowId: number;
  name: string;
  description: string | null;
  order: number;
  isInitial: boolean;
  isFinal: boolean;
  requiredPermissions: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTransition {
  id: number;
  workflowId: number;
  name: string;
  fromStageId: number;
  toStageId: number;
  requiredPermissions: string[] | null;
  createdAt: string;
  updatedAt: string;
  
  fromStage?: WorkflowStage;
  toStage?: WorkflowStage;
}

export interface ContractHistory {
  id: number;
  contractId: number;
  fromStageId: number | null;
  toStageId: number;
  transitionId: number | null;
  changedBy: number;
  note: string | null;
  createdAt: string;
  
  fromStage?: WorkflowStage;
  toStage?: WorkflowStage;
  transition?: WorkflowTransition;
  changedByUser?: User;
}
```

---

## Commission Types

### `types/commission.ts`

```typescript
export interface CommissionConfig {
  id: number;
  serviceId: number;
  roleId: number | null;
  commissionRate: string; // Decimal as string (e.g., "0.05" = 5%)
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
  
  service?: Service;
  role?: Role;
}

export interface CommissionHistory {
  id: number;
  userId: number;
  contractId: number;
  commissionConfigId: number;
  amount: string;
  commissionRate: string;
  status: 'PENDING' | 'PAID';
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  user?: User;
  contract?: Contract;
  commissionConfig?: CommissionConfig;
}

export interface CreateCommissionConfigRequest {
  serviceId: number;
  roleId?: number;
  commissionRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
}
```

---

## Audit Types

### `types/audit.ts`

```typescript
export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  resource: string;
  targetType: string | null;
  targetId: number | null;
  changes: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  
  user?: User;
}

export interface AuditLogFilters extends PaginationParams {
  userId?: number;
  action?: string;
  resource?: string;
  targetType?: string;
  targetId?: number;
}
```

---

## RBAC Types

### `types/rbac.ts`

```typescript
export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface CreatePermissionRequest {
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  resource?: string;
  action?: string;
  description?: string;
}

export interface AssignRoleRequest {
  roleId: number;
}

export interface AssignPermissionRequest {
  permissionId: number;
}
```

---

## Admin User Management Types

### `types/admin.ts`

```typescript
export interface UserFilters extends PaginationParams {
  search?: string;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ContractFilters extends PaginationParams {
  userId?: number;
  serviceId?: number;
  status?: ContractStatus;
}

export interface WithdrawalFilters extends PaginationParams {
  userId?: number;
  status?: WithdrawalStatus;
}
```

---

## ✅ Usage

1. Copy tất cả types vào `types/` folder
2. Import trong components/hooks:

```typescript
import { User, AuthResponse } from '@/types/auth';
import { Wallet, LedgerEntry } from '@/types/wallet';
import { Contract, ContractStatus } from '@/types/contract';
```

3. Sử dụng với React Query:

```typescript
const { data } = useQuery<PaginatedResponse<User>>({
  queryKey: ['users'],
  queryFn: () => apiClient.get('/admin/users'),
});
```

---

## 🔗 Next Steps

1. ✅ Setup React Query hooks từ [30-REACT-QUERY-SETUP.md](./30-REACT-QUERY-SETUP.md)
2. ✅ Build Wallet module từ [13-WALLET-MODULE.md](./13-WALLET-MODULE.md)
3. ✅ Build Contract flow từ [42-CONTRACT-APPLICATION-FLOW.md](./42-CONTRACT-APPLICATION-FLOW.md)
