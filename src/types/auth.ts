export type UserRole = 'super_admin' | 'admin' | 'mr' | 'warehouse_team' | 'auditor'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatarInitial: string
  avatarUrl?: string
  phone?: string
  designation?: string
  department?: string
  location?: string
  joinedOn?: string
}
