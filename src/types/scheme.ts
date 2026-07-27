import type { PartnerZone } from '@/types/partner'

export type SchemeType = 'general' | 'seasonal'
export type SchemePartnerType = 'Dealer' | 'Chemist'
export type SchemePartnerStatus = 'interested' | 'enrolled' | 'redeemed'

/** Base coin value plus a per-region payout multiplier for one Product Master item attached to a scheme. */
export interface SchemeApplicableProduct {
  productId: string
  baseCoinValue: number
  regionMultipliers: Partial<Record<PartnerZone, number>>
}

/** Per-partner-type redemption rule (price / points / discount price) for one gift attached to a scheme. */
export interface SchemeGiftPartnerRule {
  price: number
  points: number
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
  points: number
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
