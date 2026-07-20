import {
  mockMrPerformanceReports,
  getMrPerformanceReportById,
  getMrPerformanceDetails,
  mrPerformanceKpis,
} from '@/features/reports/mockMrPerformanceReports'
import type { MrPerformanceDetails, MrPerformanceReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

async function getMrPerformanceReports(): Promise<MrPerformanceReportRow[]> {
  return Promise.resolve(mockMrPerformanceReports)
}

async function getMrPerformanceReportDetail(id: string): Promise<MrPerformanceReportRow | undefined> {
  return Promise.resolve(getMrPerformanceReportById(id))
}

async function getMrPerformanceDetailsFull(id: string): Promise<MrPerformanceDetails | undefined> {
  return Promise.resolve(getMrPerformanceDetails(id))
}

async function getMrPerformanceKpis() {
  return Promise.resolve(mrPerformanceKpis)
}

export const mrPerformanceReportsService = {
  getMrPerformanceReports,
  getMrPerformanceReportDetail,
  getMrPerformanceDetails: getMrPerformanceDetailsFull,
  getMrPerformanceKpis,
}
