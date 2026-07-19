import type { MedicalRepresentative, MrManagedPartner } from '@/types/medicalRep'
import type { PartnerStatus, PartnerZone } from '@/types/partner'

export interface MrMonthlyActivity {
  id: string
  month: string
  scans: number
  rewardsIssued: number
  onboardings: number
}

export interface MrPerformanceReportRow {
  id: string
  mr: MedicalRepresentative
  mrName: string
  region: PartnerZone
  dealersOnboarded: number
  chemistsOnboarded: number
  totalScans: number
  performanceScore: number
  status: PartnerStatus
}

export interface MrPerformanceAnalytics {
  onboardingRate: number
  engagementScore: number
  averageScansPerPartner: number
  activePartnerRatio: number
}

export interface MrScanContribution {
  totalScans: number
  totalRewardPointsGenerated: number
  averageScansPerMonth: number
  averageRewardsPerMonth: number
}

export interface MrPerformanceDetails {
  report: MrPerformanceReportRow
  assignedDealers: MrManagedPartner[]
  assignedChemists: MrManagedPartner[]
  scanContribution: MrScanContribution
  analytics: MrPerformanceAnalytics
  monthlyActivity: MrMonthlyActivity[]
}
