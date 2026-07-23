export type PartnerInviteType = 'Dealer' | 'Chemist'

export interface PartnerInviteBasicDetails {
  name: string
  email: string
  phone: string
}

export interface PartnerInviteCredentials {
  password: string
}

export interface PartnerInviteShopDetails {
  shopName: string
  gstNumber: string
  registeredAddress: string
  city: string
  zone: 'North' | 'South' | 'East' | 'West'
  latitude: string
  longitude: string
  documents: File[]
}

export interface PartnerInviteState {
  token: string
  inviteType: PartnerInviteType
  basicDetails: PartnerInviteBasicDetails | null
  shopDetails: PartnerInviteShopDetails | null
}
