export type RewardTrack = 'Permanent Catalog' | 'Scheme Track'
export type RuleType = 'Standard Track' | 'Scheme Reward' | 'High-Outgo Scheme Reward'
export type AvailabilityStatus = 'available' | 'unavailable' | 'expired'
export type RewardRuleUserType = 'Dealer' | 'Chemist' | 'MR'

export interface RewardRuleRedemptionEntry {
  id: string
  userName: string
  userType: RewardRuleUserType
  region: string
  coinsRedeemed: number
  redemptionDate: string
  deliveryStatus: 'pending' | 'delivered' | 'cancelled'
  schemeName: string
}

export interface RewardRule {
  id: string
  rewardName: string
  rewardImages: string[]
  rewardTrack: RewardTrack
  ruleType: RuleType
  coinsRequired: number
  availabilityStatus: AvailabilityStatus
  active: boolean

  availabilityType: 'Permanent' | 'Scheme-Limited'
  activeScheme: string | null
  startDate: string | null
  endDate: string | null

  totalRedemptions: number
  pendingRedemptions: number
  successfulDeliveries: number
  remainingInventory: number
  redemptionRate: number

  eligibleUserTypes: RewardRuleUserType[]
  minimumCoinRequirement: number
  applicableScheme: string | null
  regionApplicability: string
  maximumRedemptionLimit: number

  redemptionHistory: RewardRuleRedemptionEntry[]
}
