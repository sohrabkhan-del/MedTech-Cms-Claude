export type AdminStatus = 'active' | 'pending' | 'inactive'
export type AdminRegionAccess =
  'All India' | 'North' | 'South' | 'East' | 'West'
export type AdminRole = 'Super Admin' | 'Admin'

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
  role: AdminRole
  status: AdminStatus
  totalActionsLogged: number
  createdDate: string
  recentActivity: AdminActivityEntry[]
}
