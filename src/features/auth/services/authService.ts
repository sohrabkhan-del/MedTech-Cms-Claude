import { findMockAccount } from '@/features/auth/mockAuthUsers'
import type {
  FirstLoginResetRequest,
  FirstLoginResetResponse,
  LoginRequest,
  LoginResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
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

export const authService = {
  login,
  verifyOtp,
  firstLoginReset,
  logout,
}
