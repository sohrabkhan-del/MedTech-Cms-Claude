import type { Chemist } from '@/types/chemist'
import type { PartnerStatus, PartnerZone } from '@/types/partner'

export interface ChemistReportRow {
  id: string
  chemist: Chemist
  chemistName: string
  city: string
  zone: PartnerZone
  totalScans: number
  walletPoints: number
  redemptions: number
  status: PartnerStatus
  onboardedDate: string
}

export interface ChemistPerformanceSummary {
  totalScans: number
  validScans: number
  duplicateScans: number
  invalidScans: number
  scanSuccessRate: number
  totalPointsEarned: number
  totalPointsRedeemed: number
  currentWalletBalance: number
  totalRedemptions: number
  averagePointsPerScan: number
}
