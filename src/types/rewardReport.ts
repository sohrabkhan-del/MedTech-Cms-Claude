export type RewardReportUserType = 'Dealer' | 'Chemist' | 'MR'
export type RewardReportType = 'Scan Reward' | 'Scheme Bonus' | 'Redemption' | 'Loyalty Multiplier'
export type RewardReportStatus = 'credited' | 'pending' | 'redeemed' | 'reversed'

export interface RewardReportTimelineEntry {
  id: string
  activity:
    | 'Reward Earned'
    | 'Scheme Applied'
    | 'Bonus Calculated'
    | 'Wallet Credited'
    | 'Redemption Requested'
    | 'Redemption Approved'
    | 'Redemption Completed'
    | 'Reward Reversed'
  dateTime: string
}

export interface RewardReportEntry {
  id: string

  userId: string
  userName: string
  userType: RewardReportUserType
  mobileNumber: string
  email: string
  region: string

  rewardType: RewardReportType
  rewardPoints: number
  date: string
  status: RewardReportStatus

  schemeId: string
  schemeName: string
  schemeType: string
  bonusValue: number

  baseRewardPoints: number
  multiplier: number
  bonusPoints: number
  totalRewardPoints: number

  isRedeemed: boolean
  redeemedItem?: string
  redemptionDate?: string
  coinsUsed?: number
  deliveryStatus?: string

  walletBalanceBefore: number
  walletBalanceAfter: number

  timeline: RewardReportTimelineEntry[]
}
