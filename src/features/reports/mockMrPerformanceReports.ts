import type {
  MrMonthlyActivity,
  MrPerformanceDetails,
  MrPerformanceReportRow,
} from '@/types/mrPerformanceReport'
import { mockMedicalReps, getMedicalRepById } from '@/features/systemUsers/mockMedicalReps'

const MONTHS = ['Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026']

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function computeTotalScans(seed: number, dealersOnboarded: number, chemistsOnboarded: number): number {
  const baseActivity = seededNumber(seed, 400, 3200)
  return baseActivity + (dealersOnboarded + chemistsOnboarded) * seededNumber(seed + 1, 15, 45)
}

function computePerformanceScore(dealersOnboarded: number, chemistsOnboarded: number, totalScans: number, statusActive: boolean): number {
  const onboardingComponent = Math.min((dealersOnboarded + chemistsOnboarded) * 3, 45)
  const scanComponent = Math.min(totalScans / 100, 40)
  const statusComponent = statusActive ? 15 : 5
  return Math.min(100, Math.round(onboardingComponent + scanComponent + statusComponent))
}

export const mockMrPerformanceReports: MrPerformanceReportRow[] = mockMedicalReps.map((mr, index) => {
  const seed = index + 1
  const totalScans = computeTotalScans(seed, mr.totalDealersOnboarded, mr.totalChemistsOnboarded)
  const performanceScore = computePerformanceScore(
    mr.totalDealersOnboarded,
    mr.totalChemistsOnboarded,
    totalScans,
    mr.status === 'active',
  )

  return {
    id: mr.id,
    mr,
    mrName: mr.name,
    region: mr.region,
    dealersOnboarded: mr.totalDealersOnboarded,
    chemistsOnboarded: mr.totalChemistsOnboarded,
    totalScans,
    performanceScore,
    status: mr.status,
  }
})

export function getMrPerformanceReportById(id: string): MrPerformanceReportRow | undefined {
  return mockMrPerformanceReports.find((report) => report.id === id)
}

function buildMonthlyActivity(seed: number, mrId: string, totalScans: number): MrMonthlyActivity[] {
  const weights = MONTHS.map((_, i) => 0.6 + seededNumber(seed + i, 0, 80) / 100)
  const weightSum = weights.reduce((sum, w) => sum + w, 0)

  return MONTHS.map((month, i) => {
    const scans = Math.max(10, Math.round((totalScans * weights[i]!) / weightSum))
    const rewardsIssued = scans * seededNumber(seed + i + 2, 8, 22)
    const onboardings = seededNumber(seed + i + 5, 0, 4)
    return {
      id: `${mrId}-activity-${i}`,
      month,
      scans,
      rewardsIssued,
      onboardings,
    }
  })
}

export function getMrPerformanceDetails(id: string): MrPerformanceDetails | undefined {
  const report = getMrPerformanceReportById(id)
  const mr = getMedicalRepById(id)
  if (!report || !mr) return undefined

  const seed = mockMedicalReps.findIndex((entry) => entry.id === id) + 1
  const assignedDealers = mr.managedPartners.filter((p) => p.partnerType === 'Dealer')
  const assignedChemists = mr.managedPartners.filter((p) => p.partnerType === 'Chemist')
  const monthlyActivity = buildMonthlyActivity(seed, id, report.totalScans)

  const totalRewardPointsGenerated = monthlyActivity.reduce((sum, m) => sum + m.rewardsIssued, 0)
  const averageScansPerMonth = Math.round(monthlyActivity.reduce((sum, m) => sum + m.scans, 0) / monthlyActivity.length)
  const averageRewardsPerMonth = Math.round(totalRewardPointsGenerated / monthlyActivity.length)

  const activePartners = mr.managedPartners.filter((p) => p.status === 'active').length
  const activePartnerRatio = mr.managedPartners.length > 0 ? Math.round((activePartners / mr.managedPartners.length) * 100) : 0
  const onboardingRate = Math.round(((mr.totalDealersOnboarded + mr.totalChemistsOnboarded) / Math.max(mr.totalPartnersManaged, 1)) * 100)
  const averageScansPerPartner = mr.totalPartnersManaged > 0 ? Math.round(report.totalScans / mr.totalPartnersManaged) : 0
  const engagementScore = Math.min(100, Math.round(report.performanceScore * 0.6 + activePartnerRatio * 0.4))

  return {
    report,
    assignedDealers,
    assignedChemists,
    scanContribution: {
      totalScans: report.totalScans,
      totalRewardPointsGenerated,
      averageScansPerMonth,
      averageRewardsPerMonth,
    },
    analytics: {
      onboardingRate,
      engagementScore,
      averageScansPerPartner,
      activePartnerRatio,
    },
    monthlyActivity,
  }
}

export const mrPerformanceKpis = {
  totalMrs: mockMrPerformanceReports.length,
  totalDealersOnboarded: mockMrPerformanceReports.reduce((sum, r) => sum + r.dealersOnboarded, 0),
  totalChemistsOnboarded: mockMrPerformanceReports.reduce((sum, r) => sum + r.chemistsOnboarded, 0),
  averagePerformanceScore: Math.round(
    mockMrPerformanceReports.reduce((sum, r) => sum + r.performanceScore, 0) / Math.max(mockMrPerformanceReports.length, 1),
  ),
}
