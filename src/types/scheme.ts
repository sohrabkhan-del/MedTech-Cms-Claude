export type SchemeCategory = 'general' | 'seasonal'
export type SchemeStatus = 'draft' | 'active' | 'inactive' | 'expired' | 'upcoming'
export type SchemeType = 'Scan Target' | 'Volume Bonus' | 'Loyalty Multiplier' | 'Flat Bonus'
export type ApplicableUserType = 'Dealer' | 'Chemist'
export type RewardType = 'Fixed Points' | 'Percentage Bonus' | 'Multiplier' | 'Tiered'
export type RewardFrequency = 'One-time' | 'Per Scan' | 'Weekly' | 'Monthly'

export interface SchemeEligibleProduct {
  id: string
  productCode: string
  productName: string
  productCategory: string
  productBrand: string
  bonusPoints: number
  status: 'active' | 'inactive'
}

export interface SchemeAuditEntry {
  id: string
  date: string
  action: string
  performedBy: string
  previousValue: string
  newValue: string
  remarks: string
}

export type SchemeTimelineActivity = 'Scheme Created' | 'Activated' | 'Products Assigned' | 'Modified' | 'Expired'

export interface SchemeTimelineEntry {
  id: string
  activity: SchemeTimelineActivity
  dateTime: string
}

export interface Scheme {
  id: string
  schemeName: string
  schemeCategory: SchemeCategory
  festivalCampaign?: string
  schemeType: SchemeType
  applicableUsers: ApplicableUserType[]
  bonusValue: number
  scanTarget: number
  startDate: string
  endDate: string | null
  status: SchemeStatus
  description: string

  rewardType: RewardType
  bonusPoints: number
  multiplier: number
  targetQuantity: number
  maximumReward: number
  rewardFrequency: RewardFrequency
  stackable: boolean

  eligibleProducts: SchemeEligibleProduct[]

  totalParticipants: number
  totalProductScans: number
  rewardPointsIssued: number
  completionRate: number

  timeline: SchemeTimelineEntry[]
  auditHistory: SchemeAuditEntry[]
  internalNotes: string
}
