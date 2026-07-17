import type {
  ApplicableUserType,
  RewardFrequency,
  RewardType,
  Scheme,
  SchemeAuditEntry,
  SchemeCategory,
  SchemeEligibleProduct,
  SchemeStatus,
  SchemeTimelineEntry,
  SchemeType,
} from '@/types/scheme'
import { mockProducts, productCategoryOptions } from '@/features/inventory/mockProducts'
import { mrs } from '@/features/partners/mockPartnerData'

const schemeTypes: SchemeType[] = ['Scan Target', 'Volume Bonus', 'Loyalty Multiplier', 'Flat Bonus']
const rewardTypes: RewardType[] = ['Fixed Points', 'Percentage Bonus', 'Multiplier', 'Tiered']
const rewardFrequencies: RewardFrequency[] = ['One-time', 'Per Scan', 'Weekly', 'Monthly']
const generalSchemeNames = ['Quarterly Scan Booster', 'Loyalty Growth Program', 'Volume Achiever Plan', 'Steady Rewards Circle', 'Annual Performance Bonus']
const festivals = ['Diwali Double Rewards', 'New Year Bonus Campaign', 'Holi Festival Rewards', 'Eid Promotion', 'Christmas Campaign']

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function dateFromSeed(seed: number, month = 'Jul', year = 2026): string {
  const day = (seed % 27) + 1
  return `${pad(day)} ${month} ${year}`
}

function resolveApplicableUsers(seed: number): ApplicableUserType[] {
  const options: ApplicableUserType[][] = [
    ['Dealer'],
    ['Chemist'],
    ['Dealer', 'Chemist'],
    ['Dealer', 'Chemist', 'MR'],
    ['MR'],
  ]
  return options[seed % options.length]!
}

function buildEligibleProducts(seed: number, schemeId: string): SchemeEligibleProduct[] {
  const count = seededNumber(seed, 3, 7)
  return Array.from({ length: count }).map((_, i) => {
    const product = mockProducts[(seed + i * 3) % mockProducts.length]!
    return {
      id: `${schemeId}-product-${i}`,
      productCode: product.productCode,
      productName: product.productName,
      productCategory: product.productCategory,
      productBrand: product.brand,
      bonusPoints: seededNumber(seed + i, 5, 50),
      status: product.status,
    }
  })
}

function buildTimeline(seed: number, schemeId: string, status: SchemeStatus): SchemeTimelineEntry[] {
  const timeline: SchemeTimelineEntry[] = [
    { id: `${schemeId}-tl-0`, activity: 'Scheme Created', dateTime: dateFromSeed(seed, 'Jun') },
    { id: `${schemeId}-tl-1`, activity: 'Products Assigned', dateTime: dateFromSeed(seed + 1, 'Jun') },
  ]
  if (status === 'active' || status === 'inactive' || status === 'expired') {
    timeline.push({ id: `${schemeId}-tl-2`, activity: 'Activated', dateTime: dateFromSeed(seed + 2, 'Jun') })
  }
  if (seed % 4 === 0 && status !== 'draft') {
    timeline.push({ id: `${schemeId}-tl-3`, activity: 'Modified', dateTime: dateFromSeed(seed + 4, 'Jul') })
  }
  if (status === 'expired') {
    timeline.push({ id: `${schemeId}-tl-4`, activity: 'Expired', dateTime: dateFromSeed(seed + 6, 'Jul') })
  }
  return timeline
}

function buildAuditHistory(seed: number, schemeId: string): SchemeAuditEntry[] {
  const reviewer = mrs[seed % mrs.length]!
  return [
    {
      id: `${schemeId}-audit-0`,
      date: dateFromSeed(seed, 'Jun'),
      action: 'Scheme Created',
      performedBy: reviewer,
      previousValue: '—',
      newValue: 'Scheme configured and saved as draft',
      remarks: 'Initial setup',
    },
    {
      id: `${schemeId}-audit-1`,
      date: dateFromSeed(seed + 2, 'Jun'),
      action: 'Bonus Value Updated',
      performedBy: reviewer,
      previousValue: `${seededNumber(seed, 10, 30)} pts`,
      newValue: `${seededNumber(seed + 5, 30, 60)} pts`,
      remarks: 'Adjusted per campaign budget review',
    },
  ]
}

function buildScheme(seed: number, category: SchemeCategory): Scheme {
  const id = `scheme-${category}-${seed}`
  const schemeName = category === 'general' ? generalSchemeNames[seed % generalSchemeNames.length]! : festivals[seed % festivals.length]!
  const statusRoll = seed % 10

  let status: SchemeStatus
  if (category === 'general') {
    status = statusRoll < 6 ? 'active' : statusRoll < 8 ? 'inactive' : 'expired'
  } else {
    status = statusRoll < 4 ? 'upcoming' : statusRoll < 8 ? 'active' : 'expired'
  }

  const bonusValue = seededNumber(seed, 10, 100)
  const totalParticipants = seededNumber(seed, 20, 500)
  const totalProductScans = seededNumber(seed + 1, 200, 8000)
  const completionRate = seededNumber(seed + 2, 30, 98)

  const startDate = dateFromSeed(seed, category === 'general' ? 'Jan' : 'Jul')
  const endDate = category === 'general' && seed % 5 === 0 ? null : dateFromSeed(seed + 20, category === 'general' ? 'Dec' : 'Aug')

  return {
    id,
    schemeName,
    schemeCategory: category,
    festivalCampaign: category === 'seasonal' ? schemeName : undefined,
    schemeType: schemeTypes[seed % schemeTypes.length]!,
    applicableUsers: resolveApplicableUsers(seed),
    bonusValue,
    scanTarget: seededNumber(seed, 50, 500),
    startDate,
    endDate,
    status,
    description: `${schemeName} rewards Dealers and Chemists for reaching configured scan and volume targets during the scheme period.`,

    rewardType: rewardTypes[seed % rewardTypes.length]!,
    bonusPoints: seededNumber(seed, 5, 40),
    multiplier: Number((1 + (seed % 5) * 0.25).toFixed(2)),
    targetQuantity: seededNumber(seed, 50, 300),
    maximumReward: seededNumber(seed, 500, 5000),
    rewardFrequency: rewardFrequencies[seed % rewardFrequencies.length]!,
    stackable: seed % 3 === 0,

    eligibleProducts: buildEligibleProducts(seed, id),

    totalParticipants,
    totalProductScans,
    rewardPointsIssued: totalProductScans * seededNumber(seed, 2, 8),
    completionRate,

    timeline: buildTimeline(seed, id, status),
    auditHistory: buildAuditHistory(seed, id),
    internalNotes: 'Reviewed by marketing team; performance tracked monthly.',
  }
}

export const mockGeneralSchemes: Scheme[] = Array.from({ length: 16 }).map((_, index) => buildScheme(index + 1, 'general'))
export const mockSeasonalSchemes: Scheme[] = Array.from({ length: 14 }).map((_, index) => buildScheme(index + 1, 'seasonal'))
export const mockSchemes: Scheme[] = [...mockGeneralSchemes, ...mockSeasonalSchemes]

export function getSchemeById(id: string): Scheme | undefined {
  return mockSchemes.find((scheme) => scheme.id === id)
}

export const generalSchemeKpis = {
  activeSchemes: mockGeneralSchemes.filter((s) => s.status === 'active').length,
  totalParticipants: mockGeneralSchemes.reduce((sum, s) => sum + s.totalParticipants, 0),
  rewardPointsIssued: mockGeneralSchemes.reduce((sum, s) => sum + s.rewardPointsIssued, 0),
  expiredSchemes: mockGeneralSchemes.filter((s) => s.status === 'expired').length,
}

export const seasonalSchemeKpis = {
  activeSchemes: mockSeasonalSchemes.filter((s) => s.status === 'active').length,
  upcomingCampaigns: mockSeasonalSchemes.filter((s) => s.status === 'upcoming').length,
  completedCampaigns: mockSeasonalSchemes.filter((s) => s.status === 'expired').length,
  rewardPointsIssued: mockSeasonalSchemes.reduce((sum, s) => sum + s.rewardPointsIssued, 0),
}

export const schemeApplicableUserOptions: ApplicableUserType[] = ['Dealer', 'Chemist', 'MR']
export const schemeTypeOptions = schemeTypes
export const rewardTypeOptions = rewardTypes
export const rewardFrequencyOptions = rewardFrequencies
export const festivalOptions = festivals
export { productCategoryOptions as schemeProductCategoryOptions }
