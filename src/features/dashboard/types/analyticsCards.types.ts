import type { BadgeStatus } from '@/components/common/StatusBadge/StatusBadge'

export interface DashboardOverviewCards {
  scanActivity: number
  scanActivityChange: number
  rewardsClaimed: number
  rewardsClaimedChange: number
  pendingReviews: number
  pendingReviewsChange: number
  interestActivity: number
  interestActivityChange: number
}

export interface ScanActivityGraphPoint {
  date: string
  scans: number
  rewards: number
}

export interface RecentScanCard {
  id: string
  outletName: string
  contactName: string
  role: string
  region: string
  status: BadgeStatus | string
  scannedAt: string
  timeAgo: string
}

export interface TopDealerCard {
  scanCount: number
  partnerId: string
  businessName: string
  region: string
}

export interface TopChemistCard {
  redemptionCount: number
  businessName: string
  partnerId: string
  region: string
}

export interface TopPartnersCard {
  topDealers: TopDealerCard[]
  topChemists: TopChemistCard[]
}

export interface TopProductCard {
  scanCount: number
  productId: string
  productName: string
  category: string
}

export interface RecentRedemptionCard {
  id: string
  itemName: string
  businessName: string
  points: number
  date: string
  status: BadgeStatus | string
}

export interface RewardSummaryCard {
  totalPointsEarned: number
  totalPointsClaimed: number
  totalPointsSpent: number
  monthlyGrowth: number
}

export interface AnalyticsCardsQueryParams {
  preset?: string
  startDate?: string
  endDate?: string
  regionId?: string
}
