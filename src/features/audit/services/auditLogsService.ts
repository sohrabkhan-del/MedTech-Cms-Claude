import {
  mockAuditLogs,
  getAuditLogById,
  auditLogKpis,
  auditModuleOptions,
  auditActionOptions,
  auditEntityOptions,
  auditUserRoleOptions,
} from '@/features/audit/mockAuditLogs'
import type { AuditLogEntry } from '@/features/audit/types/audit.types'
import { mockDelay } from '@/services/mockDelay'

// Audit Logs are read-only per product spec — this service only exposes
// list/detail/kpi/filter-option accessors, no create/update/delete methods.

async function getAuditLogs(): Promise<AuditLogEntry[]> {
  return mockDelay(mockAuditLogs)
}

async function getAuditLogDetail(id: string): Promise<AuditLogEntry | undefined> {
  return mockDelay(getAuditLogById(id))
}

async function getAuditLogKpis() {
  return mockDelay(auditLogKpis)
}

async function getAuditLogFilterOptions() {
  return mockDelay({
    moduleOptions: auditModuleOptions,
    actionOptions: auditActionOptions,
    entityOptions: auditEntityOptions,
    userRoleOptions: auditUserRoleOptions,
  })
}

export const auditLogsService = {
  getAuditLogs,
  getAuditLogDetail,
  getAuditLogKpis,
  getAuditLogFilterOptions,
}
