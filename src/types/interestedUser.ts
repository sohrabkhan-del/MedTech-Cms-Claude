export type LeadStatus = 'new' | 'followed_up' | 'closed'
export type LeadUserType = 'Dealer' | 'Chemist'

export interface InterestedUserLead {
  id: string
  showcaseProductId: string
  interestedProduct: string
  productCategory: string
  userId: string
  userName: string
  businessName: string
  userType: LeadUserType
  mobile: string
  regionId: string | null
  region: string
  quantityRequested: number
  stockUnit: string
  note: string
  leadStatus: LeadStatus
  requestedDate: string
  followedUpAt: string | null
  handledBy: string
  followUpNote: string
  closeReason: string
  createdAt: string
  updatedAt: string
}
