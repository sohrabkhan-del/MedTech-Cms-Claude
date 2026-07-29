import type { PartnerZone } from '@/types/partner'

export type SchemeType = 'general' | 'seasonal'
export type SchemeStatus = 'active' | 'inactive'
export type SchemePartnerType = 'Dealer' | 'Chemist'
export type SchemePartnerStatus = 'interested' | 'enrolled' | 'redeemed'

/** Per-partner-type base point value plus its own per-region payout multipliers for one Product Master item attached to a scheme. */
export interface SchemeApplicableProduct {
  productId: string
  dealerBasePointValue: number | null
  chemistBasePointValue: number | null
  dealerRegionMultipliers: Partial<Record<PartnerZone, number>>
  chemistRegionMultipliers: Partial<Record<PartnerZone, number>>
}

/** Per-partner-type redemption rule (price / Points / discount price) for one gift attached to a scheme. */
export interface SchemeGiftPartnerRule {
  price: number
  Points: number
  discountPrice: number
}

export interface SchemeGiftRule {
  giftId: string
  dealerRule: SchemeGiftPartnerRule | null
  chemistRule: SchemeGiftPartnerRule | null
}

export interface SchemePartnerEntry {
  id: string
  name: string
  region: PartnerZone
  Points: number
  status: SchemePartnerStatus
}

export interface SchemePartners {
  dealer: SchemePartnerEntry[]
  chemist: SchemePartnerEntry[]
}

export interface Scheme {
  id: string
  type: SchemeType
  name: string
  status: SchemeStatus
  startDate: string
  endDate: string | null
  partnerTypes: SchemePartnerType[]
  dealerRegions: PartnerZone[]
  chemistRegions: PartnerZone[]
  /** Union of dealerRegions/chemistRegions — kept for list/filter display and KPI aggregation. */
  regions: PartnerZone[]
  applicableProducts: SchemeApplicableProduct[]
  giftRules: SchemeGiftRule[]
  description?: string
  disclaimer?: string
  image?: string
  banner?: string
  partners: SchemePartners
}
