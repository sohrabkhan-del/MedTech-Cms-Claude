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

export type OtpUserType = 'SUPER_ADMIN' | 'ADMIN'
export type OtpPurpose = 'LOGIN' | 'FORGOT_PASSWORD'

export interface ForgotPasswordRequest {
  userType: OtpUserType
  email: string
  phone?: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message?: string
}

export interface VerifyResetOtpRequest {
  userType: OtpUserType
  userId?: string
  email?: string
  phone?: string
  purpose: OtpPurpose
  otp: string
}

export interface VerifyResetOtpResponse {
  otpId: string
}

export interface ResendOtpRequest {
  purpose: OtpPurpose
  userType: OtpUserType
  userId?: string
  email?: string
  phone?: string
  country?: string
}

export interface ResendOtpResponse {
  otpId: string
}

export interface ResetPasswordRequest {
  otpId: string
  userType: OtpUserType
  password: string
  confirmPassword: string
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
  passwordResetPhone: string | null
  passwordResetOtpId: string | null
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
