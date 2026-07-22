import type { AuthUser } from '@/types/auth'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  isFirstLogin: boolean
  tempPassword?: string
  token?: string
  refreshToken?: string
  user?: AuthUser
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface VerifyOtpResponse {
  token: string
  refreshToken: string
  user: AuthUser
}

export interface FirstLoginResetRequest {
  email: string
  tempPassword: string
  newPassword: string
}

export interface FirstLoginResetResponse {
  token: string
  refreshToken: string
  user: AuthUser
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  email: string
}

export interface VerifyResetOtpRequest {
  email: string
  otp: string
}

export interface VerifyResetOtpResponse {
  resetToken: string
}

export interface ResetPasswordRequest {
  email: string
  resetToken: string
  newPassword: string
}

export interface ResetPasswordResponse {
  success: true
}

export interface AuthState {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  pendingEmail: string | null
  tempPassword: string | null
  resetRequired: boolean
  passwordResetEmail: string | null
  passwordResetToken: string | null
}

export interface LoginFlowData {
  email: string
  tempPassword: string
  resetRequired: boolean
}

export interface Credentials {
  token: string
  refreshToken: string
  user: AuthUser
}
