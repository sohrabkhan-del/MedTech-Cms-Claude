export type AuditModule = string

export type AuditActionType = string

export type AuditEntityType = string

export type AuditUserRole = string

export interface AuditChangedField {
  id: string
  fieldName: string
  oldValue: string
  newValue: string
}

export interface AuditLogEntry {
  id: string
  module: AuditModule
  action: AuditActionType
  entity: AuditEntityType
  entityId: string
  entityName: string
  reason: string
  performedBy: string
  userRole: AuditUserRole
  dateTime: string
  ipAddress: string

  changedData: AuditChangedField[]
}

export interface AuditLogListResponse {
  items: AuditLogEntry[]
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

/** Raw shape of a single event as returned by GET /audit/timeline. */
export interface AuditTimelineApiEntry {
  id: string
  action: string
  entity: string
  entityId: string
  reason: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  actorId: string
  actorType: string
  ip: string
  userAgent: string
  createdAt: string
}

export interface AuditTimelineApiListResponse {
  items: AuditTimelineApiEntry[]
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}
