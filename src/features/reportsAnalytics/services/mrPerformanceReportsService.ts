import {
  mockMrPerformanceReports,
  getMrPerformanceReportById,
  getMrPerformanceDetails,
  mrPerformanceKpis,
} from '@/features/reportsAnalytics/mockMrPerformanceReports'
import type { MrPerformanceDetails, MrPerformanceReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

async function getMrPerformanceReports(): Promise<MrPerformanceReportRow[]> {
  return mockDelay(mockMrPerformanceReports)
}

async function getMrPerformanceReportDetail(id: string): Promise<MrPerformanceReportRow | undefined> {
  return mockDelay(getMrPerformanceReportById(id))
}

async function getMrPerformanceDetailsFull(id: string): Promise<MrPerformanceDetails | undefined> {
  return mockDelay(getMrPerformanceDetails(id))
}

async function getMrPerformanceKpis() {
  return mockDelay(mrPerformanceKpis)
}

export const mrPerformanceReportsService = {
  getMrPerformanceReports,
  getMrPerformanceReportDetail,
  getMrPerformanceDetails: getMrPerformanceDetailsFull,
  getMrPerformanceKpis,
}
