import {
  mockScanReports,
  getScanReportById,
  scanReportKpis,
  scanReportProductOptions,
  scanReportDealerOptions,
  scanReportChemistOptions,
} from '@/features/reportsAnalytics/mockScanReports'
import type { ScanReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

async function getScanReports(): Promise<ScanReportEntry[]> {
  return Promise.resolve(mockScanReports)
}

async function getScanReportDetail(id: string): Promise<ScanReportEntry | undefined> {
  return Promise.resolve(getScanReportById(id))
}

async function getScanReportKpis() {
  return Promise.resolve(scanReportKpis)
}

async function getScanReportFilterOptions() {
  return Promise.resolve({
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
