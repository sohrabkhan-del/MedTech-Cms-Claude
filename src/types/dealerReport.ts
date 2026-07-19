import type { InterestedProductEntry, PartnerStatus, PartnerZone, PointsHistoryEntry, ScanHistoryEntry } from '@/types/partner'
import type { WalletRedemptionEntry } from '@/types/wallet'

export type { PartnerStatus, PartnerZone, ScanHistoryEntry, PointsHistoryEntry, InterestedProductEntry, WalletRedemptionEntry }

export interface DealerReportRow {
  id: string
  dealerId: string
  dealerName: string
  city: string
  zone: PartnerZone
  totalScans: number
  walletPoints: number
  redemptions: number
  status: PartnerStatus
  onboardedDate: string
}

export interface DealerReportPerformanceSummary {
  scanToRewardConversion: number
  averageMonthlyScans: number
  redemptionRate: number
  activeMonths: number
}

export interface DealerReportDetails extends DealerReportRow {
  ownerName: string
  email: string
  phone: string
  licenseNumber: string
  registeredAddress: string
  assignedMr: string
  scanHistory: ScanHistoryEntry[]
  walletHistory: PointsHistoryEntry[]
  interestedProducts: InterestedProductEntry[]
  redemptionHistory: WalletRedemptionEntry[]
  performanceSummary: DealerReportPerformanceSummary
}
