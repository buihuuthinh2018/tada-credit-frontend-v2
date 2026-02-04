export type UserStatus = 'ACTIVE' | 'PENDING_VERIFY' | 'SUSPENDED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface User {
  id: string;
  email: string;
  fullname: string;
  phone: string;
  gender?: Gender;
  birth_date?: string;
  referral_code: string;
  referred_by?: string | null;
  status: UserStatus;
  created_at: string;
  updated_at?: string;
  roles?: Role[];
  permissions?: string[];
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_system?: boolean;
  permissions?: Permission[];
  _count?: {
    users: number;
    permissions: number;
  };
  created_at?: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  fullname: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate: string;
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
