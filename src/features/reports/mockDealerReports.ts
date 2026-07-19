import { mockDealers } from '@/features/dealers/mockDealers'
import { mockWallets } from '@/features/wallets/mockWallets'
import type { DealerReportDetails, DealerReportPerformanceSummary, DealerReportRow } from '@/types/dealerReport'
import type { WalletRedemptionEntry } from '@/types/wallet'

function findDealerWallet(dealerId: string) {
  return mockWallets.find((wallet) => wallet.userType === 'Dealer' && wallet.userId === dealerId)
}

function redemptionHistoryForDealer(dealerId: string): WalletRedemptionEntry[] {
  return findDealerWallet(dealerId)?.redemptionHistory ?? []
}

function buildPerformanceSummary(dealer: (typeof mockDealers)[number]): DealerReportPerformanceSummary {
  const validScans = dealer.scanHistory.filter((s) => s.result === 'valid').length
  const scanToRewardConversion = dealer.scanHistory.length === 0 ? 0 : Math.round((validScans / dealer.scanHistory.length) * 100)
  const averageMonthlyScans = Math.round(dealer.totalScans / 12)
  const redemptionRate = dealer.totalScans === 0 ? 0 : Math.round((dealer.totalRedemptions / dealer.totalScans) * 1000) / 10
  const activeMonths = Math.min(12, Math.max(1, Math.round(dealer.totalScans / (averageMonthlyScans || 1))))

  return { scanToRewardConversion, averageMonthlyScans, redemptionRate, activeMonths }
}

function toReportRow(dealer: (typeof mockDealers)[number]): DealerReportRow {
  return {
    id: dealer.id,
    dealerId: dealer.id,
    dealerName: dealer.shopName,
    city: dealer.city,
    zone: dealer.zone,
    totalScans: dealer.totalScans,
    walletPoints: dealer.availableCoins,
    redemptions: dealer.totalRedemptions,
    status: dealer.status,
    onboardedDate: dealer.pointsHistory[0]?.date ?? dealer.scanHistory[0]?.scanDate ?? '—',
  }
}

export const mockDealerReports: DealerReportRow[] = mockDealers.map(toReportRow)

export function getDealerReportById(id: string): DealerReportDetails | undefined {
  const dealer = mockDealers.find((d) => d.id === id)
  if (!dealer) return undefined

  return {
    ...toReportRow(dealer),
    ownerName: dealer.ownerName,
    email: dealer.email,
    phone: dealer.phone,
    licenseNumber: dealer.licenseNumber,
    registeredAddress: dealer.registeredAddress,
    assignedMr: dealer.assignedMr,
    scanHistory: dealer.scanHistory,
    walletHistory: dealer.pointsHistory,
    interestedProducts: dealer.interestedProducts,
    redemptionHistory: redemptionHistoryForDealer(dealer.id),
    performanceSummary: buildPerformanceSummary(dealer),
  }
}

export const dealerReportKpis = {
  totalDealers: mockDealerReports.length,
  activeDealers: mockDealerReports.filter((r) => r.status === 'active').length,
  totalScans: mockDealerReports.reduce((sum, r) => sum + r.totalScans, 0),
  totalRewardPoints: mockDealerReports.reduce((sum, r) => sum + r.walletPoints, 0),
}
