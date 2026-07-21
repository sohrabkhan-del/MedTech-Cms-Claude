import type { AvailabilityStatus, RewardRule, RewardRuleRedemptionEntry, RewardRuleUserType, RewardTrack, RuleType } from '@/types/giftRule'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'
import { mockSeasonalSchemes } from '@/features/schemeManagement/mockSchemes'

const permanentRewardNames = ['Bronze Coin Bundle', 'Silver Coin Bundle', 'Standard Cashback Voucher', 'Loyalty Badge Unlock', 'Basic Merchandise Kit']
const schemeRewardNames = ['Festival Bonus Coins', 'Gold Coin Reward', 'Premium Gift Hamper', 'High-Value Cashback', 'Limited Edition Merchandise']
const regions = ['All India', 'North', 'South', 'East', 'West']

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

function resolveEligibleUsers(seed: number): RewardRuleUserType[] {
  const options: RewardRuleUserType[][] = [['Dealer'], ['Chemist'], ['Dealer', 'Chemist'], ['Dealer', 'Chemist', 'MR'], ['MR']]
  return options[seed % options.length]!
}

function buildRedemptionHistory(seed: number, ruleId: string): RewardRuleRedemptionEntry[] {
  const count = seededNumber(seed, 2, 6)
  const statuses: RewardRuleRedemptionEntry['deliveryStatus'][] = ['pending', 'delivered', 'delivered', 'cancelled']
  const scheme = mockSeasonalSchemes[seed % mockSeasonalSchemes.length]!
  return Array.from({ length: count }).map((_, i) => {
    const localSeed = seed * 11 + i
    const userType: RewardRuleUserType = localSeed % 2 === 0 ? 'Dealer' : 'Chemist'
    const partner = userType === 'Dealer' ? mockDealers[localSeed % mockDealers.length]! : mockChemists[localSeed % mockChemists.length]!
    return {
      id: `${ruleId}-redeem-${i}`,
      userName: partner.shopName,
      userType,
      region: partner.zone,
      coinsRedeemed: seededNumber(localSeed, 100, 3000),
      redemptionDate: dateFromSeed(localSeed, 'Jul'),
      deliveryStatus: statuses[localSeed % statuses.length]!,
      schemeName: scheme.schemeName,
    }
  })
}

function buildRewardRule(seed: number, rewardTrack: RewardTrack): RewardRule {
  const id = `reward-rule-${seed}`
  const isPermanent = rewardTrack === 'Permanent Catalog'
  const rewardName = isPermanent ? permanentRewardNames[seed % permanentRewardNames.length]! : schemeRewardNames[seed % schemeRewardNames.length]!
  const ruleType: RuleType = isPermanent ? 'Standard Track' : seed % 3 === 0 ? 'High-Outgo Scheme Reward' : 'Scheme Reward'
  const scheme = mockSeasonalSchemes[seed % mockSeasonalSchemes.length]!
  const availabilityStatus: AvailabilityStatus = isPermanent ? 'available' : seed % 4 === 0 ? 'expired' : 'available'
  const totalRedemptions = seededNumber(seed, 20, 600)
  const pendingRedemptions = seededNumber(seed + 1, 0, 30)
  const successfulDeliveries = totalRedemptions - pendingRedemptions

  return {
    id,
    rewardName,
    rewardImages: [
      `https://picsum.photos/seed/medtech-reward-${seed}-${rewardTrack === 'Permanent Catalog' ? 'perm' : 'scheme'}-a/600/600`,
      `https://picsum.photos/seed/medtech-reward-${seed}-${rewardTrack === 'Permanent Catalog' ? 'perm' : 'scheme'}-b/600/600`,
    ],
    rewardTrack,
    ruleType,
    coinsRequired: seededNumber(seed, 100, isPermanent ? 3000 : 8000),
    availabilityStatus,
    active: availabilityStatus !== 'expired' && seed % 10 !== 0,

    availabilityType: isPermanent ? 'Permanent' : 'Scheme-Limited',
    activeScheme: isPermanent ? null : scheme.schemeName,
    startDate: isPermanent ? null : scheme.startDate,
    endDate: isPermanent ? null : scheme.endDate,

    totalRedemptions,
    pendingRedemptions,
    successfulDeliveries,
    remainingInventory: seededNumber(seed + 2, 0, 500),
    redemptionRate: seededNumber(seed + 3, 20, 95),

    eligibleUserTypes: resolveEligibleUsers(seed),
    minimumCoinRequirement: seededNumber(seed, 50, 500),
    applicableScheme: isPermanent ? null : scheme.schemeName,
    regionApplicability: regions[seed % regions.length]!,
    maximumRedemptionLimit: seededNumber(seed, 1, 10),

    redemptionHistory: buildRedemptionHistory(seed, id),
  }
}

export const mockPermanentCatalogRewards: RewardRule[] = Array.from({ length: 12 }).map((_, index) => buildRewardRule(index + 1, 'Permanent Catalog'))
export const mockSchemeTrackRewards: RewardRule[] = Array.from({ length: 10 }).map((_, index) => buildRewardRule(index + 1, 'Scheme Track'))
export const mockRewardRules: RewardRule[] = [...mockPermanentCatalogRewards, ...mockSchemeTrackRewards]

export function getRewardRuleById(id: string): RewardRule | undefined {
  return mockRewardRules.find((rule) => rule.id === id)
}

export const currentActiveScheme = mockSeasonalSchemes.find((s) => s.status === 'active')?.schemeName ?? mockSeasonalSchemes[0]?.schemeName ?? '—'

export const giftRulesDashboard = {
  permanentCatalogRewards: mockPermanentCatalogRewards.length,
  activeSchemeRewards: mockSchemeTrackRewards.filter((r) => r.availabilityStatus === 'available').length,
  currentActiveScheme,
  standardTrackRewards: mockRewardRules.filter((r) => r.ruleType === 'Standard Track').length,
  highOutgoSchemeRewards: mockRewardRules.filter((r) => r.ruleType === 'High-Outgo Scheme Reward').length,
}

export const rewardTrackOptions: RewardTrack[] = ['Permanent Catalog', 'Scheme Track']
export const ruleTypeOptions: RuleType[] = ['Standard Track', 'Scheme Reward', 'High-Outgo Scheme Reward']
export const schemeNameOptions = mockSeasonalSchemes.map((s) => s.schemeName)
