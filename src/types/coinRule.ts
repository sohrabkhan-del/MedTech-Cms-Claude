export type CoinRuleRegion = 'North' | 'South' | 'East' | 'West'

export interface RegionCoinHistoryEntry {
  id: string
  region: CoinRuleRegion
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
  region: CoinRuleRegion
  previousMultiplier: number
  currentMultiplier: number
  previousPoints: number
  previousEffectiveDate: string
  currentPoints: number
  currentEffectiveDate: string
}

export interface CoinValueRule {
  id: string
  modelCode: string
  productCategory: string
  productName: string
  defaultCoinValue: number
  baseCoinValue: number

  regions: RegionMultiplierRow[]
  regionalHistory: RegionCoinHistoryEntry[]

  lastModifiedBy: string
  lastUpdatedTime: string
}
