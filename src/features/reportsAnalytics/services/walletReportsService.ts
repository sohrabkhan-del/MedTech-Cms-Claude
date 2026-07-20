import { mockWalletReports, getWalletReportById, walletReportKpis } from '@/features/reports/mockWalletReports'
import type { WalletReportDetails, WalletReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

async function getWalletReports(): Promise<WalletReportRow[]> {
  return Promise.resolve(mockWalletReports)
}

async function getWalletReportDetail(id: string): Promise<WalletReportDetails | undefined> {
  return Promise.resolve(getWalletReportById(id))
}

async function getWalletReportKpis() {
  return Promise.resolve(walletReportKpis)
}

export const walletReportsService = {
  getWalletReports,
  getWalletReportDetail,
  getWalletReportKpis,
}
