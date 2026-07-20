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

// Master Scan Table Logs are read-only per product spec — this service only
// exposes list/detail/kpi/filter-option accessors, no create/update/delete methods.

async function getMasterScanLogs(): Promise<MasterScanLogEntry[]> {
  return Promise.resolve(mockMasterScanLogs)
}

async function getMasterScanLogDetail(id: string): Promise<MasterScanLogEntry | undefined> {
  return Promise.resolve(getMasterScanLogById(id))
}

async function getMasterScanLogKpis() {
  return Promise.resolve(masterScanLogKpis)
}

async function getMasterScanLogFilterOptions() {
  return Promise.resolve({
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
