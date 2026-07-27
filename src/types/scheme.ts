import type { PartnerZone } from '@/types/partner'

export type SchemeType = 'general' | 'seasonal'
export type SchemePartnerType = 'Dealer' | 'Chemist'
export type SchemePartnerStatus = 'interested' | 'enrolled' | 'redeemed'

export interface SchemeProduct {
  productId: string
  dealerPoints: number
  chemistPoints: number
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
  regions: PartnerZone[]
  partnerTypes: SchemePartnerType[]
  products: SchemeProduct[]
  description?: string
  disclaimer?: string
  image?: string
  banner?: string
  partners: SchemePartners
}
