import { mockWallets } from '@/features/wallets/mockWallets'
import type { WalletReportDetails, WalletReportManualAdjustment, WalletReportRow } from '@/types/walletReport'

function sumByType(wallet: (typeof mockWallets)[number], type: 'credit' | 'debit'): number {
  return wallet.transactions.filter((txn) => txn.transactionType === type).reduce((sum, txn) => sum + Math.abs(txn.coinsAdjusted), 0)
}

function latestTransactionDate(wallet: (typeof mockWallets)[number]): string {
  return wallet.transactions[0]?.transactionDate ?? wallet.lastUpdated
}

function buildManualAdjustments(wallet: (typeof mockWallets)[number]): WalletReportManualAdjustment[] {
  return wallet.transactions
    .filter((txn) => txn.transactionSource === 'Manual Adjustment')
    .map((txn) => ({
      id: `${txn.id}-adj`,
      date: txn.transactionDate,
      type: txn.transactionType,
      coins: Math.abs(txn.coinsAdjusted),
      reason: txn.reason,
      performedBy: txn.performedBy,
    }))
}

function toReportRow(wallet: (typeof mockWallets)[number]): WalletReportRow {
  return {
    id: wallet.id,
    walletId: wallet.id,
    userId: wallet.userId,
    userName: wallet.userName,
    userType: wallet.userType,
    region: wallet.region,
    mobileNumber: wallet.mobileNumber,
    walletBalance: wallet.availableBalance,
    credits: sumByType(wallet, 'credit'),
    debits: sumByType(wallet, 'debit'),
    lastTransaction: latestTransactionDate(wallet),
    status: wallet.status,
  }
}

export const mockWalletReports: WalletReportRow[] = mockWallets.map(toReportRow)

export function getWalletReportById(id: string): WalletReportDetails | undefined {
  const wallet = mockWallets.find((w) => w.id === id)
  if (!wallet) return undefined

  return {
    ...toReportRow(wallet),
    registrationDate: wallet.registrationDate,
    email: wallet.email,
    lifetimeEarned: wallet.lifetimeEarned,
    lifetimeRedeemed: wallet.lifetimeRedeemed,
    pendingRedemptionCoins: wallet.pendingRedemptionCoins,
    transactions: wallet.transactions,
    manualAdjustments: buildManualAdjustments(wallet),
    redemptionHistory: wallet.redemptionHistory,
    timeline: wallet.timeline,
  }
}

export const walletReportKpis = {
  totalWallets: mockWalletReports.length,
  totalBalanceOutstanding: mockWalletReports.reduce((sum, r) => sum + r.walletBalance, 0),
  totalCredits: mockWalletReports.reduce((sum, r) => sum + r.credits, 0),
  totalDebits: mockWalletReports.reduce((sum, r) => sum + r.debits, 0),
}
