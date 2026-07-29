export type WalletUserType = 'Dealer' | 'Chemist'
export type WalletStatus = 'active' | 'inactive' | 'suspended'
export type TransactionType = 'credit' | 'debit'
export type TransactionSource =
  | 'Product Scan'
  | 'Scheme Reward'
  | 'Manual Adjustment'
  | 'Redemption'
  | 'Referral Program'
  | 'Promotional Campaign'
  | 'Fraud Recovery'
export type TransactionStatus = 'completed' | 'pending' | 'reversed'
export type WalletRedemptionStatus =
  'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled'

export interface WalletTransaction {
  id: string
  transactionDate: string
  transactionType: TransactionType
  previousBalance: number
  PointsAdjusted: number
  updatedBalance: number
  transactionSource: TransactionSource
  reason: string
  referenceNumber: string
  performedBy: string
  status: TransactionStatus
}

export interface WalletRedemptionEntry {
  id: string
  giftName: string
  category: string
  PointsRedeemed: number
  requestDate: string
  approvalDate: string | null
  deliveryDate: string | null
  redemptionStatus: WalletRedemptionStatus
  courierPartner: string | null
  trackingNumber: string | null
}

export interface EarnedPointsBreakdown {
  productScans: number
  activeSchemes: number
  referralProgram: number
  promotionalCampaigns: number
  manualCredits: number
}

export interface RecentRewardActivity {
  id: string
  date: string
  productName: string
  qrCode: string
  dealer: string
  chemist: string
  PointsEarned: number
  appliedScheme: string
  status: 'credited' | 'pending' | 'failed'
}

export type WalletTimelineActivity =
  | 'Reward Points Earned'
  | 'Manual Point Adjustment'
  | 'Redemption Request'
  | 'Scheme Reward'
  | 'Fraud Recovery'
  | 'Admin Action'

export interface WalletTimelineEntry {
  id: string
  activity: WalletTimelineActivity
  dateTime: string
}

export interface FraudAdjustmentEntry {
  id: string
  incidentId: string
  PointsAdjusted: number
  adjustmentReason: string
  actionTaken: string
  performedBy: string
  dateTime: string
}

export interface Wallet {
  id: string
  userId: string
  userName: string
  userType: WalletUserType
  mobileNumber: string
  email: string
  region: string
  registrationDate: string
  status: WalletStatus

  availableBalance: number
  lifetimeEarned: number
  lifetimeRedeemed: number
  manualAdjustments: number
  pendingRedemptionPoints: number
  lastUpdated: string

  transactions: WalletTransaction[]
  redemptionHistory: WalletRedemptionEntry[]
  earnedPointsBreakdown: EarnedPointsBreakdown
  recentActivity: RecentRewardActivity[]
  timeline: WalletTimelineEntry[]
  fraudLog: FraudAdjustmentEntry[]
  internalNotes: string
}
