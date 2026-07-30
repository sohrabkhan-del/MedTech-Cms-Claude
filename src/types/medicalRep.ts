import type { PartnerZone, PartnerStatus } from '@/types/partner'

export type MrPartnerType = 'Dealer' | 'Chemist'
export type MrPartnerSource = 'Onboarded' | 'Assigned'

export interface MrManagedPartner {
  id: string
  partnerName: string
  partnerType: MrPartnerType
  city: string
  region: PartnerZone
  source: MrPartnerSource
  status: PartnerStatus
}

export interface MedicalRepresentative {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  country?: string
  region: PartnerZone
  regionId?: string
  status: PartnerStatus
  lastLogin: string
  notes?: string
  totalDealersOnboarded: number
  totalChemistsOnboarded: number
  totalPartnersManaged: number
  managedPartners: MrManagedPartner[]
}
