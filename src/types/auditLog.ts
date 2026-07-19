export type AuditModule =
  | 'Dealers'
  | 'Chemists'
  | 'Medical Representatives'
  | 'Products'
  | 'Schemes'
  | 'Rewards'
  | 'Wallet'
  | 'Redemptions'
  | 'System Users'
  | 'Authentication'

export type AuditActionType = 'Login' | 'Record Created' | 'Record Updated' | 'Record Deleted' | 'Export' | 'Logout'

export type AuditEntityType =
  | 'Dealer'
  | 'Chemist'
  | 'MR'
  | 'Product'
  | 'Scheme'
  | 'Reward'
  | 'Wallet'
  | 'Redemption'
  | 'User'

export type AuditStatus = 'success' | 'failed'

export type AuditUserRole = 'Super Admin' | 'Admin' | 'MR' | 'System'

export interface AuditChangedField {
  id: string
  fieldName: string
  oldValue: string
  newValue: string
}

export interface AuditTimelineEvent {
  id: string
  activity: AuditActionType
  dateTime: string
}

export interface AuditLogEntry {
  id: string
  module: AuditModule
  action: AuditActionType
  entity: AuditEntityType
  entityId: string
  entityName: string
  performedBy: string
  userRole: AuditUserRole
  dateTime: string
  ipAddress: string
  device: string
  browser: string
  status: AuditStatus

  changedData: AuditChangedField[]
  timeline: AuditTimelineEvent[]
}
