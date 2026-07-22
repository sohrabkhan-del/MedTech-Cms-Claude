import { mockWalletReports, getWalletReportById, walletReportKpis } from '@/features/reportsAnalytics/mockWalletReports'
import type { WalletReportDetails, WalletReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

async function getWalletReports(): Promise<WalletReportRow[]> {
  return mockDelay(mockWalletReports)
}

async function getWalletReportDetail(id: string): Promise<WalletReportDetails | undefined> {
  return mockDelay(getWalletReportById(id))
}

async function getWalletReportKpis() {
  return mockDelay(walletReportKpis)
}

export const walletReportsService = {
  getWalletReports,
  getWalletReportDetail,
  getWalletReportKpis,
}
