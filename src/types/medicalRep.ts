import type { PartnerZone, PartnerStatus } from '@/types/partner'

export type MrPartnerType = 'Dealer' | 'Chemist'
export type MrPartnerSource = 'QR Scan' | 'Manual Onboarding' | 'Referral'

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
  referenceId?: string
  employeeCode?: string
  name: string
  fullName?: string
  lastName?: string
  email: string
  phone: string
  country?: string
  region: PartnerZone
  regionId?: string
  status: PartnerStatus
  lastLogin: string
  notes?: string
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  isBlocked?: boolean
  blockedReason?: string
  profileImageUrl?: string
  totalDealersOnboarded: number
  totalChemistsOnboarded: number
  totalPartnersManaged: number
  managedPartners: MrManagedPartner[]
}
