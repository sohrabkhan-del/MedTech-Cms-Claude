import { mockDealerReports, getDealerReportById, dealerReportKpis } from '@/features/reportsAnalytics/mockDealerReports'
import type { DealerReportDetails, DealerReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

async function getDealerReports(): Promise<DealerReportRow[]> {
  return mockDelay(mockDealerReports)
}

async function getDealerReportDetail(id: string): Promise<DealerReportDetails | undefined> {
  return mockDelay(getDealerReportById(id))
}

async function getDealerReportKpis() {
  return mockDelay(dealerReportKpis)
}

export const dealerReportsService = {
  getDealerReports,
  getDealerReportDetail,
  getDealerReportKpis,
}
