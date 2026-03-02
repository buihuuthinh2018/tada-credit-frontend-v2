# TADA Credit Frontend

A modern, scalable frontend application for the TADA Credit financial service platform built with Next.js 16+, TypeScript, and TailwindCSS.

## 🚀 Tech Stack

- **Next.js 16+** - App Router architecture
- **TypeScript** - Type-safe development
- **Zustand** - Lightweight state management with persistence
- **React Query (TanStack Query)** - Server state management & caching
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Axios** - HTTP client with interceptors
- **Sonner** - Toast notifications

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard routes
│   │   ├── users/         # User management
│   │   ├── contracts/     # Contract review
│   │   ├── withdrawals/   # Withdrawal processing
│   │   ├── services/      # Service configuration
│   │   ├── documents/     # Document requirements config
│   │   ├── workflows/     # Workflow configuration
│   │   ├── audit-logs/    # Audit logs viewer
│   │   └── roles/         # RBAC management
│   ├── dashboard/         # User dashboard routes
│   │   ├── wallet/        # Wallet & transactions
│   │   ├── contracts/     # User contracts
│   │   ├── referrals/     # Referral management
│   │   └── commission/    # Commission tracking
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── unauthorized/      # Access denied page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── auth/              # Auth components (ProtectedRoute, PermissionGate)
│   ├── layouts/           # Layout components (Sidebar, Header, AdminSidebar)
│   ├── providers/         # Context providers
│   └── ...                # Feature-specific components
├── hooks/                 # Custom React hooks
│   ├── use-auth.ts        # Authentication hooks
│   ├── use-wallet.ts      # Wallet data hooks
│   ├── use-contracts.ts   # Contract management hooks
│   ├── use-services.ts    # Service hooks
│   ├── use-users.ts       # Admin user management hooks
│   ├── use-workflows.ts   # Workflow configuration hooks
│   ├── use-documents.ts   # Document management hooks
│   └── use-audit-logs.ts  # Audit log hooks
├── store/                 # Zustand stores
│   └── auth-store.ts      # Authentication state
├── lib/                   # Utility functions
│   ├── api-client.ts      # Axios instance with interceptors
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript type definitions
    ├── auth.ts            # Auth types
    ├── wallet.ts          # Wallet & withdrawal types
    ├── contract.ts        # Contract types
    ├── service.ts         # Service types
    ├── workflow.ts        # Workflow types
    ├── document.ts        # Document types
    └── index.ts           # Re-exports all types
```

## 🔐 Features

### User Dashboard
- **Wallet Management**: View balance, transaction history, request withdrawals
- **Contract Management**: Create contracts, fill questionnaires, upload documents
- **Commission Tracking**: View referral earnings and commission history
- **Referral System**: Share referral codes, track referrals

### Admin Dashboard
- **User Management**: View, verify, suspend, activate users, assign roles
- **Contract Review**: Review contracts, transition workflow stages, review documents
- **Withdrawal Processing**: Approve/reject withdrawal requests
- **Service Configuration**: Create and manage services
- **Document Configuration**: Configure document requirements
- **Workflow Configuration**: Create and manage workflow stages and transitions
- **Audit Logs**: View all system activity

### Role-Based Access Control (RBAC)
- Protected routes based on authentication and roles
- Component-level permission gates
- Dynamic navigation based on user roles

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## 🔗 API Integration

The frontend communicates with the backend API using:

- **Axios** for HTTP requests with automatic token refresh
- **React Query** for caching, background refetching, and optimistic updates
- **Zustand** for auth state persistence

### Authentication Flow
1. User logs in → tokens stored in Zustand (persisted)
2. Axios interceptor adds Bearer token to requests
3. On 401 → auto-refresh token using refresh token
4. On refresh failure → logout and redirect to login

## 📱 Pages Overview

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/login` | Login page | Public |
| `/register` | Registration page | Public |
| `/dashboard` | User dashboard home | Authenticated |
| `/dashboard/wallet` | Wallet & withdrawals | Authenticated |
| `/dashboard/contracts` | Contract list | Authenticated |
| `/dashboard/contracts/new` | Create new contract | Authenticated |
| `/dashboard/contracts/[id]` | Contract details | Authenticated |
| `/admin` | Admin dashboard home | Admin |
| `/admin/users` | User management | Admin |
| `/admin/contracts` | Contract review | Admin |
| `/admin/withdrawals` | Withdrawal processing | Admin |
| `/admin/services` | Service configuration | Admin |
| `/admin/documents` | Document configuration | Admin |
| `/admin/workflows` | Workflow configuration | Admin |
| `/admin/audit-logs` | Audit logs | Admin |

## 🎨 UI Components

Built with shadcn/ui components:
- Button, Input, Label, Textarea
- Card, Badge, Skeleton
- Table, Tabs, Select
- Dialog, DropdownMenu
- Avatar, Separator

## 📝 License

This project is part of the TADA Credit platform.

