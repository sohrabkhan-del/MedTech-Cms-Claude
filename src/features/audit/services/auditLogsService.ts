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

// Audit Logs are read-only per product spec — this service only exposes
// list/detail/kpi/filter-option accessors, no create/update/delete methods.

async function getAuditLogs(): Promise<AuditLogEntry[]> {
  return Promise.resolve(mockAuditLogs)
}

async function getAuditLogDetail(id: string): Promise<AuditLogEntry | undefined> {
  return Promise.resolve(getAuditLogById(id))
}

async function getAuditLogKpis() {
  return Promise.resolve(auditLogKpis)
}

async function getAuditLogFilterOptions() {
  return Promise.resolve({
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
