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
