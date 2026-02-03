# 02 - API Endpoints Reference

## 🔗 Base URL

```sh
http://localhost:5000/api
```

## 🔑 Authentication Headers

```typescript
headers: {
  'Authorization': 'Bearer <accessToken>',
  'Content-Type': 'application/json'
}
```

---

## 1. Authentication (`/api/auth`)

### POST /api/auth/register

**Description**: Đăng ký tài khoản mới  
**Public**: ✅ Yes

**Request Body**:

```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  referralCode?: string; // Optional
}
```

**Response**:

```typescript
{
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
  }
}
```

---

### POST /api/auth/login

**Description**: Đăng nhập  
**Public**: ✅ Yes

**Request Body**:

```typescript
{
  email: string;
  password: string;
}
```

**Response**:

```typescript
{
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
  }
}
```

---

### POST /api/auth/refresh

**Description**: Refresh access token  
**Public**: ✅ Yes

**Request Body**:

```typescript
{
  refreshToken: string;
}
```

**Response**:

```typescript
{
  accessToken: string;
}
```

---

### POST /api/auth/logout

**Description**: Đăng xuất  
**Protected**: 🔒 Yes

**Request Body**:

```typescript
{
  refreshToken: string;
}
```

**Response**:

```typescript
{
  message: string; // "Logged out successfully"
}
```

---

## 2. User Management

### GET /api/users/me

**Description**: Lấy thông tin user hiện tại  
**Protected**: 🔒 Yes

**Response**:

```typescript
{
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isVerified: boolean;
  isActive: boolean;
  roles: Array<{
    id: number;
    name: string;
    permissions: Array<{
      resource: string;
      action: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

---

### PUT /api/users/me

**Description**: Cập nhật thông tin cá nhân  
**Protected**: 🔒 Yes

**Request Body**:

```typescript
{
  firstName?: string;
  lastName?: string;
  phone?: string;
}
```

**Response**: Updated user object

---

### GET /api/users/me/referrals

**Description**: Lấy danh sách người được giới thiệu  
**Protected**: 🔒 Yes

**Query Params**:

- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response**:

```typescript
{
  data: Array<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}
```

---

## 3. Admin - User Management

### GET /api/admin/users

**Description**: Lấy danh sách users (admin)  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `users:read`

**Query Params**:

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional)
- `role` (string, optional)
- `isVerified` (boolean, optional)
- `isActive` (boolean, optional)

**Response**:

```typescript
{
  data: User[];
  total: number;
  page: number;
  limit: number;
}
```

---

### GET /api/admin/users/:id

**Description**: Lấy thông tin user theo ID  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `users:read`

**Response**: User object with roles and permissions

---

### PUT /api/admin/users/:id

**Description**: Cập nhật user  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `users:update`

**Request Body**:

```typescript
{
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}
```

---

### POST /api/admin/users/:id/roles/:roleId

**Description**: Gán role cho user  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `users:update`

---

### PATCH /api/admin/users/:id/roles/:roleId/remove

**Description**: Xóa role khỏi user  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `users:update`

---

### PATCH /api/admin/users/:id/verify

**Description**: Verify user  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `users:update`

---

### PATCH /api/admin/users/:id/suspend

**Description**: Suspend user  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `users:update`

---

### PATCH /api/admin/users/:id/activate

**Description**: Activate user  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `users:update`

---

### GET /api/admin/users/:id/referrals

**Description**: Xem referrals của user  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `users:read`

---

## 4. Wallet & Transactions

### GET /api/wallet

**Description**: Lấy thông tin ví của user hiện tại  
**Protected**: 🔒 Yes

**Response**:

```typescript
{
  id: number;
  userId: number;
  balance: string; // Decimal string
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

### GET /api/wallet/balance

**Description**: Lấy số dư ví  
**Protected**: 🔒 Yes

**Response**:

```typescript
{
  balance: string;
}
```

---

### GET /api/wallet/transactions

**Description**: Lấy lịch sử giao dịch  
**Protected**: 🔒 Yes

**Query Params**:

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `entryType` (DEBIT | CREDIT, optional)

**Response**:

```typescript
{
  data: Array<{
    id: number;
    entryType: 'DEBIT' | 'CREDIT';
    amount: string;
    balanceBefore: string;
    balanceAfter: string;
    description: string;
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}
```

---

## 5. Withdrawals

### POST /api/withdrawals

**Description**: Tạo yêu cầu rút tiền  
**Protected**: 🔒 Yes

**Request Body**:

```typescript
{
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  note?: string;
}
```

**Response**:

```typescript
{
  id: number;
  userId: number;
  amount: string;
  bankName: string;
  bankAccountNumber: string;
  status: 'PENDING';
  createdAt: string;
}
```

---

### GET /api/withdrawals

**Description**: Lấy danh sách withdrawals của user  
**Protected**: 🔒 Yes

**Query Params**:

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (PENDING | PROCESSING | COMPLETED | FAILED | CANCELLED, optional)

**Response**: Paginated withdrawal list

---

### GET /api/withdrawals/:id

**Description**: Lấy chi tiết withdrawal  
**Protected**: 🔒 Yes

**Response**: Withdrawal object

---

### PATCH /api/withdrawals/:id/cancel

**Description**: Hủy yêu cầu rút tiền  
**Protected**: 🔒 Yes

**Response**: Updated withdrawal with status CANCELLED

---

## 6. Admin - Withdrawals

### GET /api/admin/withdrawals

**Description**: Lấy tất cả withdrawals (admin)  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `withdrawals:read`

**Query Params**:

- `page`, `limit`, `status` (same as above)
- `userId` (number, optional)

---

### GET /api/admin/withdrawals/:id

**Description**: Xem chi tiết withdrawal  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `withdrawals:read`

---

### PATCH /api/admin/withdrawals/:id/process

**Description**: Xử lý withdrawal (approve/reject)  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `withdrawals:update`

**Request Body**:

```typescript
{
  action: 'APPROVE' | 'REJECT';
  note?: string;
}
```

---

## 7. Contracts

### POST /api/contracts

**Description**: Tạo hồ sơ/hợp đồng mới  
**Protected**: 🔒 Yes

**Request Body**:

```typescript
{
  serviceId: number;
}
```

**Response**:

```typescript
{
  id: number;
  userId: number;
  serviceId: number;
  workflowId: number;
  currentStageId: number;
  status: 'ACTIVE';
  createdAt: string;
}
```

---

### GET /api/contracts

**Description**: Lấy danh sách hợp đồng của user  
**Protected**: 🔒 Yes

**Query Params**:

- `page`, `limit`
- `status` (optional)

---

### GET /api/contracts/:id

**Description**: Lấy chi tiết contract  
**Protected**: 🔒 Yes

**Response**: Contract with service, workflow, current stage, documents, answers

---

### PUT /api/contracts/:id/answers

**Description**: Trả lời câu hỏi trong hồ sơ  
**Protected**: 🔒 Yes

**Request Body**:

```typescript
{
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}
```

---

### GET /api/contracts/:id/transitions

**Description**: Lấy các transitions có thể thực hiện  
**Protected**: 🔒 Yes

**Response**:

```typescript
Array<{
  id: number;
  name: string;
  fromStageId: number;
  toStageId: number;
}>
```

---

### GET /api/contracts/:id/history

**Description**: Xem lịch sử thay đổi trạng thái  
**Protected**: 🔒 Yes

---

### POST /api/contracts/:id/documents/:docReqId/upload

**Description**: Upload tài liệu  
**Protected**: 🔒 Yes

**Request**: multipart/form-data

- `files` (File[])

---

## 8. Admin - Contracts

### GET /api/admin/contracts

**Description**: Lấy tất cả contracts  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `contracts:read`

**Query Params**:

- `page`, `limit`
- `userId` (number, optional)
- `serviceId` (number, optional)
- `status` (optional)

---

### GET /api/admin/contracts/:id

**Description**: Xem chi tiết contract  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `contracts:read`

---

### PATCH /api/admin/contracts/:id/transition

**Description**: Thực hiện transition (chuyển trạng thái)  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `contracts:update`

**Request Body**:

```typescript
{
  transitionId: number;
  note?: string;
}
```

---

### GET /api/admin/contracts/:id/transitions

**Description**: Xem available transitions  
**Protected**: 🔒 Yes (Admin)

---

### GET /api/admin/contracts/:id/history

**Description**: Xem lịch sử  
**Protected**: 🔒 Yes (Admin)

---

## 9. Services

### GET /api/services

**Description**: Lấy danh sách dịch vụ  
**Public**: ✅ Yes

**Response**:

```typescript
Array<{
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}>
```

---

### GET /api/services/:id

**Description**: Lấy chi tiết service  
**Public**: ✅ Yes

**Response**: Service with documents and questions required

---

## 10. Commission

### GET /api/commission/history

**Description**: Lấy lịch sử hoa hồng  
**Protected**: 🔒 Yes

**Query Params**:

- `page`, `limit`
- `status` (PENDING | PAID, optional)

**Response**:

```typescript
{
  data: Array<{
    id: number;
    amount: string;
    commissionRate: string;
    status: 'PENDING' | 'PAID';
    paidAt: string | null;
    contract: {
      id: number;
      service: { name: string };
    };
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}
```

---

## 11. Audit Logs

### GET /api/admin/audit-logs

**Description**: Xem audit logs  
**Protected**: 🔒 Yes (Admin)  
**Permission**: `audit:read`

**Query Params**:

- `page`, `limit`
- `userId` (number, optional)
- `action` (string, optional)
- `resource` (string, optional)

---

### GET /api/admin/audit-logs/by-user

**Description**: Xem logs theo user  
**Protected**: 🔒 Yes (Admin)

**Query**: `userId` (required)

---

### GET /api/admin/audit-logs/by-target

**Description**: Xem logs theo target  
**Protected**: 🔒 Yes (Admin)

**Query**: `targetType`, `targetId` (required)

---

### GET /api/admin/audit-logs/by-action

**Description**: Xem logs theo action  
**Protected**: 🔒 Yes (Admin)

**Query**: `action` (required)

---

## ✅ Next Steps

1. ✅ Copy TypeScript types từ [05-TYPESCRIPT-TYPES.md](./05-TYPESCRIPT-TYPES.md)
2. ✅ Setup Axios client từ [03-AUTHENTICATION.md](./03-AUTHENTICATION.md)
3. ✅ Setup React Query hooks từ [30-REACT-QUERY-SETUP.md](./30-REACT-QUERY-SETUP.md)
4. ✅ Build UI components
