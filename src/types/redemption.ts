export type RedemptionUserType = 'Dealer' | 'Chemist'
export type RedemptionStatus = 'pending' | 'approved' | 'rejected' | 'completed'
export type RedemptionDeliveryStatus = 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled'

export type RedemptionTimelineActivity =
  | 'Redemption Request Created'
  | 'Pending Approval'
  | 'Approved by Admin'
  | 'Rejected by Admin'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Completed'

export interface RedemptionTimelineEntry {
  id: string
  activity: RedemptionTimelineActivity
  dateTime: string
}

export interface RedemptionHistoryEntry {
  id: string
  rewardItem: string
  coinsUsed: number
  requestDate: string
  approvalDate: string | null
  deliveryDate: string | null
  status: RedemptionStatus
  approvedBy: string | null
}

export interface RedemptionRequest {
  id: string
  userId: string
  userName: string
  userType: RedemptionUserType
  mobileNumber: string
  email: string
  region: string
  registrationDate: string

  rewardItem: string
  rewardCategory: string
  quantity: number
  coinsUsed: number
  requestDate: string
  expectedDeliveryDate: string

  currentWalletBalance: number
  walletBalanceAfterRedemption: number

  redemptionStatus: RedemptionStatus
  approvedBy: string | null
  deliveryStatus: RedemptionDeliveryStatus

  transactionId: string
  transactionDate: string
  transactionStatus: 'completed' | 'pending' | 'reversed'

  timeline: RedemptionTimelineEntry[]
  history: RedemptionHistoryEntry[]
  internalNotes: string
}
