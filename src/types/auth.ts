export type UserRole = 'super_admin' | 'admin' | 'mr' | 'warehouse_team' | 'auditor'
export type UserStatus = 'active' | 'pending' | 'inactive'

export interface AuthUserRegion {
  id: string
  code: string
  name: string
  isActive: boolean
}

export interface AuthUser {
  id: string
  referenceId?: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  role: UserRole
  status?: UserStatus
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  avatarInitial: string
  avatarUrl?: string
  phone?: string
  location?: string
  regions?: AuthUserRegion[]
  joinedOn?: string
}
