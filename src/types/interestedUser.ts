export type LeadStatus = 'new' | 'in_progress' | 'closed'
export type LeadUserType = 'Dealer' | 'Chemist'

export interface InterestedUserLead {
  id: string
  userId: string
  userName: string
  userType: LeadUserType
  region: string
  interestedProduct: string
  leadStatus: LeadStatus
  requestedDate: string
  handledBy: string
  leadSource: string
  progressPercentage: number
  lastActivity: string
  followUpStatus: string
}
