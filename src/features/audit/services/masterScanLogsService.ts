import {
  mockMasterScanLogs,
  getMasterScanLogById,
  masterScanLogKpis,
  distributorOptions,
  dealerOptions,
  chemistOptions,
  batchOptions,
  productOptions,
} from '@/features/audit/mockMasterScanLogs'
import type { MasterScanLogEntry } from '@/features/audit/types/audit.types'
import { mockDelay } from '@/services/mockDelay'

// Master Scan Table Logs are read-only per product spec — this service only
// exposes list/detail/kpi/filter-option accessors, no create/update/delete methods.

async function getMasterScanLogs(): Promise<MasterScanLogEntry[]> {
  return mockDelay(mockMasterScanLogs)
}

async function getMasterScanLogDetail(id: string): Promise<MasterScanLogEntry | undefined> {
  return mockDelay(getMasterScanLogById(id))
}

async function getMasterScanLogKpis() {
  return mockDelay(masterScanLogKpis)
}

async function getMasterScanLogFilterOptions() {
  return mockDelay({
    distributorOptions,
    dealerOptions,
    chemistOptions,
    batchOptions,
    productOptions,
  })
}

export const masterScanLogsService = {
  getMasterScanLogs,
  getMasterScanLogDetail,
  getMasterScanLogKpis,
  getMasterScanLogFilterOptions,
}
