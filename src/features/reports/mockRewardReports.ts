import type { RewardReportEntry, RewardReportStatus, RewardReportTimelineEntry, RewardReportType, RewardReportUserType } from '@/types/rewardReport'
import { mockDealers } from '@/features/dealers/mockDealers'
import { mockChemists } from '@/features/chemists/mockChemists'
import { mockMedicalReps } from '@/features/systemUsers/mockMedicalReps'
import { mockSchemes } from '@/features/schemes/mockSchemes'
import { mockGifts } from '@/features/schemes/mockGifts'

const rewardTypes: RewardReportType[] = ['Scan Reward', 'Scheme Bonus', 'Redemption', 'Loyalty Multiplier']
const deliveryStatuses = ['Pending', 'Packed', 'Shipped', 'Delivered']

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function dateFromSeed(seed: number, month = 'Jul'): string {
  const day = (seed % 27) + 1
  return `${pad(day)} ${month} 2026`
}

function resolveStatus(seed: number): RewardReportStatus {
  const roll = seed % 10
  if (roll < 5) return 'credited'
  if (roll < 7) return 'redeemed'
  if (roll < 9) return 'pending'
  return 'reversed'
}

function resolveUser(seed: number): { id: string; name: string; type: RewardReportUserType; mobile: string; email: string; region: string } {
  const roll = seed % 3
  if (roll === 0) {
    const dealer = mockDealers[seed % mockDealers.length]!
    return { id: dealer.id, name: dealer.shopName, type: 'Dealer', mobile: dealer.phone, email: dealer.email, region: dealer.zone }
  }
  if (roll === 1) {
    const chemist = mockChemists[seed % mockChemists.length]!
    return { id: chemist.id, name: chemist.shopName, type: 'Chemist', mobile: chemist.phone, email: chemist.email, region: chemist.zone }
  }
  const mr = mockMedicalReps[seed % mockMedicalReps.length]!
  return { id: mr.id, name: mr.name, type: 'MR', mobile: mr.phone, email: mr.email, region: mr.region }
}

function buildTimeline(seed: number, entryId: string, status: RewardReportStatus, isRedeemed: boolean): RewardReportTimelineEntry[] {
  const timeline: RewardReportTimelineEntry[] = [
    { id: `${entryId}-tl-0`, activity: 'Reward Earned', dateTime: dateFromSeed(seed, 'Jun') },
    { id: `${entryId}-tl-1`, activity: 'Scheme Applied', dateTime: dateFromSeed(seed + 1, 'Jun') },
    { id: `${entryId}-tl-2`, activity: 'Bonus Calculated', dateTime: dateFromSeed(seed + 1, 'Jun') },
  ]
  if (status === 'reversed') {
    timeline.push({ id: `${entryId}-tl-3`, activity: 'Reward Reversed', dateTime: dateFromSeed(seed + 2, 'Jun') })
    return timeline
  }
  if (status === 'pending') return timeline

  timeline.push({ id: `${entryId}-tl-3`, activity: 'Wallet Credited', dateTime: dateFromSeed(seed + 2, 'Jun') })
  if (isRedeemed) {
    timeline.push({ id: `${entryId}-tl-4`, activity: 'Redemption Requested', dateTime: dateFromSeed(seed + 4, 'Jul') })
    timeline.push({ id: `${entryId}-tl-5`, activity: 'Redemption Approved', dateTime: dateFromSeed(seed + 5, 'Jul') })
    if (status === 'redeemed') {
      timeline.push({ id: `${entryId}-tl-6`, activity: 'Redemption Completed', dateTime: dateFromSeed(seed + 6, 'Jul') })
    }
  }
  return timeline
}

function buildRewardReport(index: number): RewardReportEntry {
  const seed = index + 1
  const id = `RPT-RWD-${100000 + index}`
  const user = resolveUser(seed)
  const rewardType = rewardTypes[seed % rewardTypes.length]!
  const scheme = mockSchemes[seed % mockSchemes.length]!
  const status = resolveStatus(seed)
  const isRedeemed = status === 'redeemed'
  const gift = mockGifts[seed % mockGifts.length]!

  const baseRewardPoints = seededNumber(seed, 10, 60)
  const multiplier = Number((1 + (seed % 4) * 0.25).toFixed(2))
  const bonusPoints = seededNumber(seed + 1, 0, 30)
  const totalRewardPoints = Math.round(baseRewardPoints * multiplier) + bonusPoints

  const walletBalanceBefore = seededNumber(seed, 500, 15000)
  const walletBalanceAfter = status === 'reversed' ? walletBalanceBefore : walletBalanceBefore + totalRewardPoints - (isRedeemed ? gift.requiredCoins : 0)

  return {
    id,

    userId: user.id,
    userName: user.name,
    userType: user.type,
    mobileNumber: user.mobile,
    email: user.email,
    region: user.region,

    rewardType,
    rewardPoints: totalRewardPoints,
    date: dateFromSeed(seed, 'Jul'),
    status,

    schemeId: scheme.id,
    schemeName: scheme.schemeName,
    schemeType: scheme.schemeType,
    bonusValue: scheme.bonusValue,

    baseRewardPoints,
    multiplier,
    bonusPoints,
    totalRewardPoints,

    isRedeemed,
    redeemedItem: isRedeemed ? gift.giftName : undefined,
    redemptionDate: isRedeemed ? dateFromSeed(seed + 6, 'Jul') : undefined,
    coinsUsed: isRedeemed ? gift.requiredCoins : undefined,
    deliveryStatus: isRedeemed ? deliveryStatuses[seed % deliveryStatuses.length] : undefined,

    walletBalanceBefore,
    walletBalanceAfter,

    timeline: buildTimeline(seed, id, status, isRedeemed),
  }
}

export const mockRewardReports: RewardReportEntry[] = Array.from({ length: 60 }).map((_, index) => buildRewardReport(index))

export function getRewardReportById(id: string): RewardReportEntry | undefined {
  return mockRewardReports.find((entry) => entry.id === id)
}

export const rewardReportKpis = {
  totalRewardsIssued: mockRewardReports.length,
  totalPointsDistributed: mockRewardReports.reduce((sum, r) => sum + r.rewardPoints, 0),
  activeSchemesCount: new Set(mockRewardReports.map((r) => r.schemeId)).size,
  redemptionRate: Math.round((mockRewardReports.filter((r) => r.isRedeemed).length / mockRewardReports.length) * 100),
}

export const rewardReportUserTypeOptions: RewardReportUserType[] = ['Dealer', 'Chemist', 'MR']
export const rewardReportTypeOptions = rewardTypes
export const rewardReportSchemeOptions = Array.from(new Set(mockRewardReports.map((r) => r.schemeName))).sort()
export const rewardReportStatusOptions: RewardReportStatus[] = ['credited', 'pending', 'redeemed', 'reversed']
