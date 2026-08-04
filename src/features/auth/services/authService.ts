import { apiClient } from '@/services/apiClient'
import { findMockAccount } from '@/features/auth/mockAuthUsers'
import type { AuthUser, UserRole } from '@/types/auth'
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

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface AdminLoginData {
  accessToken: string
  refreshToken: string
}

interface AdminProfileRegion {
  id: string
  code: string
  name: string
  isActive: boolean
}

interface AdminProfileData {
  id: string
  referenceId?: string
  email: string
  country?: string | null
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  profileImageUrl?: string | null
  role: string
  status?: string
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  region?: string | null
  regions?: AdminProfileRegion[]
}

interface UpdateOwnProfileRequest {
  firstName: string
  lastName: string
  phone: string
  email: string
  regionIds: string[]
}

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

function mapRole(role: string): UserRole {
  const normalized = role.toLowerCase()

  if (normalized === 'super_admin') return 'super_admin'
  if (normalized === 'warehouse_team') return 'warehouse_team'
  if (normalized === 'mr') return 'mr'
  if (normalized === 'auditor') return 'auditor'
  return 'admin'
}

function mapStatus(status?: string): AuthUser['status'] {
  if (!status) return undefined
  const normalized = status.toLowerCase()
  if (normalized === 'active') return 'active'
  if (normalized === 'pending') return 'pending'
  return 'inactive'
}

function mapAdminProfile(profile: AdminProfileData): AuthUser {
  const firstName = profile.firstName?.trim() ?? ''
  const lastName = profile.lastName?.trim() ?? ''
  const name = [firstName, lastName].filter(Boolean).join(' ') || profile.email

  return {
    id: profile.id,
    referenceId: profile.referenceId,
    name,
    firstName: profile.firstName ?? undefined,
    lastName: profile.lastName ?? undefined,
    email: profile.email,
    role: mapRole(profile.role),
    status: mapStatus(profile.status),
    isEmailVerified: profile.isEmailVerified,
    isPhoneVerified: profile.isPhoneVerified,
    avatarInitial: name.charAt(0).toUpperCase(),
    avatarUrl: profile.profileImageUrl ?? undefined,
    phone: profile.phone
      ? `${profile.country ?? ''}${profile.phone}`
      : undefined,
    location: profile.region ?? undefined,
    regions: profile.regions,
  }
}

function mockToken(email: string, kind: 'access' | 'refresh'): string {
  return `mock-${kind}-token.${btoa(email)}.${Date.now()}`
}

async function login(payload: LoginRequest): Promise<LoginResponse> {
  console.info('[auth] login request', { email: payload.email })

  const loginResponse = await apiClient.post<ApiResponse<AdminLoginData>>(
    '/admins/login',
    payload,
  )
  const { accessToken, refreshToken } = loginResponse.data.data

  console.info('[auth] login response', {
    success: loginResponse.data.success,
    hasAccessToken: Boolean(accessToken),
    hasRefreshToken: Boolean(refreshToken),
  })

  const profileResponse = await apiClient.get<ApiResponse<AdminProfileData>>(
    '/admins/me',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  console.info('[auth] profile response', profileResponse.data.data)

  return {
    isFirstLogin: false,
    token: accessToken,
    refreshToken,
    user: mapAdminProfile(profileResponse.data.data),
  }
}

async function getMe(): Promise<AuthUser> {
  console.info('[auth] me request')
  const response =
    await apiClient.get<ApiResponse<AdminProfileData>>('/admins/me')
  console.info('[auth] me response', response.data.data)
  return mapAdminProfile(response.data.data)
}

async function updateOwnProfile(
  id: string,
  payload: UpdateOwnProfileRequest,
): Promise<AuthUser> {
  console.info('[auth] update-profile request', { id })
  const response = await apiClient.put<ApiResponse<AdminProfileData>>(
    `/admins/${id}`,
    payload,
  )
  console.info('[auth] update-profile response', response.data.data)
  return mapAdminProfile(response.data.data)
}

async function changePassword(
  payload: ChangePasswordRequest,
  accessToken?: string,
): Promise<{ success: true }> {
  console.info('[auth] change-password request')
  const response = await apiClient.post<ApiResponse<unknown>>(
    '/admins/change-password',
    payload,
    {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    },
  )
  console.info('[auth] change-password response', response.data)
  return { success: true }
}

async function verifyOtp(
  payload: VerifyOtpRequest,
): Promise<VerifyOtpResponse> {
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

async function firstLoginReset(
  payload: FirstLoginResetRequest,
): Promise<FirstLoginResetResponse> {
  const session = await login({
    email: payload.email,
    password: payload.tempPassword,
  })

  if (!session.token) {
    throw new Error('Login response is missing access token.')
  }

  await changePassword(
    {
      currentPassword: payload.tempPassword,
      newPassword: payload.newPassword,
      confirmPassword: payload.newPassword,
    },
    session.token,
  )
  return login({
    email: payload.email,
    password: payload.newPassword,
  }) as Promise<FirstLoginResetResponse>
}

async function logout(): Promise<void> {
  return Promise.resolve()
}

async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const account = findMockAccount(payload.email)

  if (!account) {
    throw new Error('No account found with this email address')
  }

  return { email: payload.email }
}

async function verifyResetOtp(
  payload: VerifyResetOtpRequest,
): Promise<VerifyResetOtpResponse> {
  const account = findMockAccount(payload.email)

  if (!account) {
    throw new Error('Account not found')
  }

  if (payload.otp !== '123456') {
    throw new Error('Invalid or expired OTP')
  }

  return { resetToken: mockToken(payload.email, 'access') }
}

async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const account = findMockAccount(payload.email)

  if (!account) {
    throw new Error('Account not found')
  }

  return { success: true }
}

export const authService = {
  login,
  getMe,
  updateOwnProfile,
  changePassword,
  verifyOtp,
  firstLoginReset,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
}
