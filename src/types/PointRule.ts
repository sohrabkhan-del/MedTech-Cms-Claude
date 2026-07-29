export type PointRuleRegion = 'North' | 'South' | 'East' | 'West'
export type PointRulePartnerType = 'Dealer' | 'Chemist'
export type PointRuleStatus = 'active' | 'inactive'

export interface RegionPointHistoryEntry {
  id: string
  region: PointRuleRegion
  previousMultiplier: number
  currentMultiplier: number
  previousRewardPoints: number
  previousEffectiveDate: string
  currentRewardPoints: number
  currentEffectiveDate: string
  changedBy: string
  changedAt: string
}

export interface RegionMultiplierRow {
  region: PointRuleRegion
  previousMultiplier: number
  currentMultiplier: number
  previousPoints: number
  previousEffectiveDate: string
  currentPoints: number
  currentEffectiveDate: string
}

export interface PointValueRule {
  id: string
  partnerType: PointRulePartnerType
  modelCode: string
  productCategory: string
  productName: string
  defaultPointValue: number
  basePointValue: number
  status: PointRuleStatus

  regions: RegionMultiplierRow[]
  regionalHistory: RegionPointHistoryEntry[]

  lastModifiedBy: string
  lastUpdatedTime: string
}
