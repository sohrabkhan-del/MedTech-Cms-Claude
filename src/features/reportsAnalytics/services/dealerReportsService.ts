import { mockDealerReports, getDealerReportById, dealerReportKpis } from '@/features/reports/mockDealerReports'
import type { DealerReportDetails, DealerReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

async function getDealerReports(): Promise<DealerReportRow[]> {
  return Promise.resolve(mockDealerReports)
}

async function getDealerReportDetail(id: string): Promise<DealerReportDetails | undefined> {
  return Promise.resolve(getDealerReportById(id))
}

async function getDealerReportKpis() {
  return Promise.resolve(dealerReportKpis)
}

export const dealerReportsService = {
  getDealerReports,
  getDealerReportDetail,
  getDealerReportKpis,
}
