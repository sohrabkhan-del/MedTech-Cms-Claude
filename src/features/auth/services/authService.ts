import { findMockAccount } from '@/features/auth/mockAuthUsers'
import type {
  FirstLoginResetRequest,
  FirstLoginResetResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  VerifyResetOtpRequest,
  VerifyResetOtpResponse,
} from '@/features/auth/types/auth.types'

// TODO: swap these mock-backed implementations for apiClient calls once the
// real auth API is available. Function signatures are designed to stay the same.

function mockToken(email: string, kind: 'access' | 'refresh'): string {
  return `mock-${kind}-token.${btoa(email)}.${Date.now()}`
}

async function login(payload: LoginRequest): Promise<LoginResponse> {
  const account = findMockAccount(payload.email)

  if (!account || account.password !== payload.password) {
    throw new Error('Invalid email or password')
  }

  return {
    isFirstLogin: false,
    token: mockToken(payload.email, 'access'),
    refreshToken: mockToken(payload.email, 'refresh'),
    user: account.user,
  }
}

async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const account = findMockAccount(payload.email)

  if (!account) {
    throw new Error('Account not found')
  }

  return {
    token: mockToken(payload.email, 'access'),
    refreshToken: mockToken(payload.email, 'refresh'),
    user: account.user,
  }
}

async function firstLoginReset(payload: FirstLoginResetRequest): Promise<FirstLoginResetResponse> {
  const account = findMockAccount(payload.email)

  if (!account) {
    throw new Error('Account not found')
  }

  return {
    token: mockToken(payload.email, 'access'),
    refreshToken: mockToken(payload.email, 'refresh'),
    user: account.user,
  }
}

async function logout(): Promise<void> {
  return Promise.resolve()
}

async function forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const account = findMockAccount(payload.email)

  if (!account) {
    throw new Error('No account found with this email address')
  }

  return { email: payload.email }
}

async function verifyResetOtp(payload: VerifyResetOtpRequest): Promise<VerifyResetOtpResponse> {
  const account = findMockAccount(payload.email)

  if (!account) {
    throw new Error('Account not found')
  }

  if (payload.otp !== '123456') {
    throw new Error('Invalid or expired OTP')
  }

  return { resetToken: mockToken(payload.email, 'access') }
}

async function resetPassword(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const account = findMockAccount(payload.email)

  if (!account) {
    throw new Error('Account not found')
  }

  return { success: true }
}

export const authService = {
  login,
  verifyOtp,
  firstLoginReset,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
}
