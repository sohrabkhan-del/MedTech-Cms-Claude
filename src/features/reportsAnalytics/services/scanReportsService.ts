import {
  mockScanReports,
  getScanReportById,
  scanReportKpis,
  scanReportProductOptions,
  scanReportDealerOptions,
  scanReportChemistOptions,
} from '@/features/reportsAnalytics/mockScanReports'
import type { ScanReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

async function getScanReports(): Promise<ScanReportEntry[]> {
  return mockDelay(mockScanReports)
}

async function getScanReportDetail(id: string): Promise<ScanReportEntry | undefined> {
  return mockDelay(getScanReportById(id))
}

async function getScanReportKpis() {
  return mockDelay(scanReportKpis)
}

async function getScanReportFilterOptions() {
  return mockDelay({
    productOptions: scanReportProductOptions,
    dealerOptions: scanReportDealerOptions,
    chemistOptions: scanReportChemistOptions,
  })
}

export const scanReportsService = {
  getScanReports,
  getScanReportDetail,
  getScanReportKpis,
  getScanReportFilterOptions,
}
