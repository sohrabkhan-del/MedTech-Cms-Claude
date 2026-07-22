import {
  mockChemistReports,
  getChemistReportById,
  getChemistPerformanceSummary,
  chemistReportKpis,
} from '@/features/reportsAnalytics/mockChemistReports'
import type { ChemistPerformanceSummary, ChemistReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

async function getChemistReports(): Promise<ChemistReportRow[]> {
  return mockDelay(mockChemistReports)
}

async function getChemistReportDetail(id: string): Promise<ChemistReportRow | undefined> {
  return mockDelay(getChemistReportById(id))
}

async function getChemistPerformanceSummaryDetail(id: string): Promise<ChemistPerformanceSummary | undefined> {
  return mockDelay(getChemistPerformanceSummary(id))
}

async function getChemistReportKpis() {
  return mockDelay(chemistReportKpis)
}

export const chemistReportsService = {
  getChemistReports,
  getChemistReportDetail,
  getChemistPerformanceSummary: getChemistPerformanceSummaryDetail,
  getChemistReportKpis,
}
