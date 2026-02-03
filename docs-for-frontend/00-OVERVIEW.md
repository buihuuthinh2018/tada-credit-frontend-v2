# 00 - System Overview

## 🎯 Hệ Thống TADA Credit

TADA Credit là một nền tảng quản lý tín dụng và giới thiệu khách hàng (referral) với các tính năng:

### Core Features
1. **Authentication & Authorization** - JWT + RBAC
2. **User Management** - Quản lý người dùng, phân quyền
3. **Wallet & Ledger** - Ví điện tử, giao dịch, rút tiền
4. **Contract Management** - Quản lý hợp đồng vay/tín dụng
5. **Commission & Referral** - Hoa hồng giới thiệu
6. **Document Management** - Quản lý tài liệu KYC
7. **Workflow Engine** - Quy trình duyệt hồ sơ
8. **Audit System** - Audit logs

---

## 👥 System Roles

### 1. **SUPER_ADMIN**
- Toàn quyền quản trị hệ thống
- Quản lý roles, permissions
- Xem audit logs

### 2. **ADMIN**
- Quản lý users, contracts
- Duyệt hồ sơ
- Quản lý cấu hình hệ thống

### 3. **AGENCY** (Đại lý)
- Giới thiệu khách hàng
- Xem hoa hồng
- Quản lý ví cá nhân

### 4. **CUSTOMER** (Khách hàng)
- Nộp hồ sơ vay
- Upload tài liệu
- Xem trạng thái hợp đồng

---

## 🏗️ System Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend    │────▶│   Database   │
│  (NextJS)   │     │   (NestJS)   │     │   (MySQL)    │
└─────────────┘     └──────────────┘     └──────────────┘
      │                     │                     │
      │                     │                     │
      ▼                     ▼                     ▼
  Zustand +          Prisma ORM +        MySQL Tables:
  React Query        JWT Guards           - users
  Axios              RBAC                 - wallets
  Shadcn/ui          Swagger              - contracts
                                          - transactions
```

---

## 🔐 Authentication Flow

```
1. User Login (POST /api/auth/login)
   ├─▶ Email + Password
   └─▶ Returns: { accessToken, refreshToken, user }

2. Store in Zustand + localStorage
   ├─▶ accessToken → Axios interceptor (Authorization header)
   └─▶ refreshToken → localStorage

3. Protected Routes
   ├─▶ Middleware checks auth
   └─▶ Redirect to /login if unauthorized

4. Token Refresh (POST /api/auth/refresh)
   ├─▶ When accessToken expires (401)
   └─▶ Auto refresh with refreshToken
```

---

## 📊 Database Schema (Key Tables)

### users
- id, email, password (hashed)
- firstName, lastName, phone
- isVerified, isActive
- createdAt, updatedAt

### wallets
- id, userId
- balance (Decimal)
- isVerified
- createdAt

### ledger_entries
- id, walletId, transactionId
- entryType (DEBIT/CREDIT)
- amount, balanceBefore, balanceAfter
- createdAt

### contracts
- id, userId, serviceId, workflowId
- currentStageId
- referrerId (agency)
- status, createdAt

### commission_histories
- id, userId, contractId
- amount, commissionRate
- status, paidAt

---

## 🚀 Tech Stack

### Frontend (NextJS)
- **Framework**: NextJS 14+ (App Router)
- **Styling**: TailwindCSS
- **Components**: Shadcn/ui
- **State Management**: Zustand
- **Server State**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner

### Backend (NestJS)
- **Framework**: NestJS 11+
- **ORM**: Prisma
- **Database**: MySQL
- **Auth**: JWT (jsonwebtoken)
- **Validation**: class-validator
- **Documentation**: Swagger
- **Security**: bcrypt, helmet

---

## 📁 Frontend Folder Structure

```
tada-credit-frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── profile/
│   │   ├── wallet/
│   │   └── contracts/
│   └── admin/
│       ├── layout.tsx
│       ├── users/
│       ├── contracts/
│       └── settings/
├── components/
│   ├── ui/              # Shadcn components
│   ├── layouts/
│   ├── auth/
│   └── features/
├── lib/
│   ├── api-client.ts    # Axios setup
│   ├── react-query.ts   # React Query config
│   └── utils.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-wallet.ts
│   └── use-contracts.ts
├── store/
│   └── auth-store.ts    # Zustand
└── types/
    ├── api.ts
    ├── user.ts
    └── contract.ts
```

---

## 🔗 Next Steps

1. ✅ Setup NextJS project
2. ✅ Copy TypeScript types from [05-TYPESCRIPT-TYPES.md](./05-TYPESCRIPT-TYPES.md)
3. ✅ Setup Authentication from [03-AUTHENTICATION.md](./03-AUTHENTICATION.md)
4. ✅ Setup React Query from [30-REACT-QUERY-SETUP.md](./30-REACT-QUERY-SETUP.md)
5. ✅ Build features using API endpoints from [02-API-ENDPOINTS.md](./02-API-ENDPOINTS.md)
