import type {
  FraudAdjustmentEntry,
  TransactionType,
  WalletRedemptionEntry,
  WalletStatus,
  WalletTimelineEntry,
  WalletTransaction,
  WalletUserType,
} from '@/types/wallet'

export type {
  WalletStatus,
  WalletUserType,
  WalletTransaction,
  WalletRedemptionEntry,
  WalletTimelineEntry,
  FraudAdjustmentEntry,
}

export interface WalletReportRow {
  id: string
  walletId: string
  userId: string
  userName: string
  businessName: string
  userType: WalletUserType
  region: string
  mobileNumber: string
  walletBalance: number
  credits: number
  debits: number
  lastTransaction: string
  lastTransactionType: TransactionType
  status: WalletStatus
}

export interface WalletReportManualAdjustment {
  id: string
  date: string
  type: 'credit' | 'debit'
  Points: number
  reason: string
  performedBy: string
}

export interface WalletReportDetails extends WalletReportRow {
  registrationDate: string
  email: string
  lifetimeEarned: number
  lifetimeRedeemed: number
  pendingRedemptionPoints: number
  transactions: WalletTransaction[]
  manualAdjustments: WalletReportManualAdjustment[]
  redemptionHistory: WalletRedemptionEntry[]
  timeline: WalletTimelineEntry[]
}
