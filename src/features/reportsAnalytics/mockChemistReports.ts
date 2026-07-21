import type { ChemistPerformanceSummary, ChemistReportRow } from '@/types/chemistReport'
import { mockChemists } from '@/features/userManagement/mockChemists'

export const mockChemistReports: ChemistReportRow[] = mockChemists.map((chemist) => ({
  id: chemist.id,
  chemist,
  chemistName: chemist.shopName,
  city: chemist.city,
  zone: chemist.zone,
  totalScans: chemist.totalScans,
  walletPoints: chemist.availableCoins,
  redemptions: chemist.totalRedemptions,
  status: chemist.status,
  onboardedDate: chemist.geoLock.lastVerifiedDate,
}))

export function getChemistReportById(id: string): ChemistReportRow | undefined {
  return mockChemistReports.find((report) => report.id === id)
}

export function getChemistPerformanceSummary(id: string): ChemistPerformanceSummary | undefined {
  const report = getChemistReportById(id)
  if (!report) return undefined
  const { chemist } = report

  const validScans = chemist.scanHistory.filter((s) => s.result === 'valid').length
  const duplicateScans = chemist.scanHistory.filter((s) => s.result === 'duplicate').length
  const invalidScans = chemist.scanHistory.filter((s) => s.result === 'invalid').length
  const scanSuccessRate = chemist.scanHistory.length > 0 ? Math.round((validScans / chemist.scanHistory.length) * 100) : 0

  const totalPointsEarned = chemist.pointsHistory.filter((p) => p.type === 'credit').reduce((sum, p) => sum + p.points, 0)
  const totalPointsRedeemed = chemist.pointsHistory.filter((p) => p.type === 'debit').reduce((sum, p) => sum + p.points, 0)
  const averagePointsPerScan = chemist.totalScans > 0 ? Math.round(totalPointsEarned / Math.max(chemist.scanHistory.length, 1)) : 0

  return {
    totalScans: chemist.totalScans,
    validScans,
    duplicateScans,
    invalidScans,
    scanSuccessRate,
    totalPointsEarned,
    totalPointsRedeemed,
    currentWalletBalance: chemist.availableCoins,
    totalRedemptions: chemist.totalRedemptions,
    averagePointsPerScan,
  }
}

export const chemistReportKpis = {
  totalChemists: mockChemistReports.length,
  activeChemists: mockChemistReports.filter((r) => r.status === 'active').length,
  totalScans: mockChemistReports.reduce((sum, r) => sum + r.totalScans, 0),
  totalRewardPoints: mockChemistReports.reduce((sum, r) => sum + r.walletPoints, 0),
}
