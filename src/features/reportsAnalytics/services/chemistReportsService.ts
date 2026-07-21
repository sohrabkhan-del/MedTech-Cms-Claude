import {
  mockChemistReports,
  getChemistReportById,
  getChemistPerformanceSummary,
  chemistReportKpis,
} from '@/features/reportsAnalytics/mockChemistReports'
import type { ChemistPerformanceSummary, ChemistReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

async function getChemistReports(): Promise<ChemistReportRow[]> {
  return Promise.resolve(mockChemistReports)
}

async function getChemistReportDetail(id: string): Promise<ChemistReportRow | undefined> {
  return Promise.resolve(getChemistReportById(id))
}

async function getChemistPerformanceSummaryDetail(id: string): Promise<ChemistPerformanceSummary | undefined> {
  return Promise.resolve(getChemistPerformanceSummary(id))
}

async function getChemistReportKpis() {
  return Promise.resolve(chemistReportKpis)
}

export const chemistReportsService = {
  getChemistReports,
  getChemistReportDetail,
  getChemistPerformanceSummary: getChemistPerformanceSummaryDetail,
  getChemistReportKpis,
}
