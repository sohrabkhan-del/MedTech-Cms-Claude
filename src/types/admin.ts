export type AdminStatus = 'active' | 'pending' | 'inactive'
export type AdminRegionAccess =
  'All India' | 'North' | 'South' | 'East' | 'West'
export type AdminRole = 'Super Admin' | 'Admin'
export type AdminModulePermission =
  | 'operations'
  | 'inventory_management'
  | 'partners'
  | 'verification'
  | 'marketing_product'
  | 'scheme_management'
  | 'reward_wallet'
  | 'reports_and_analytics'

export interface AdminModule {
  code: AdminModulePermission
  name: string
  description: string
}

export interface AdminActivityEntry {
  id: string
  actionPerformed: string
  targetRecord: string
  timestamp: string
  ipAddress: string
}

export interface Admin {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  regionAccess: AdminRegionAccess
  regionIds: string[]
  modulePermissions: AdminModulePermission[]
  role: AdminRole
  status: AdminStatus
  totalActionsLogged: number
  createdDate: string
  recentActivity: AdminActivityEntry[]
}
