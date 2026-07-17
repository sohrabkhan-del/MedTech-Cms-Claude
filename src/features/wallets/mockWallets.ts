import type {
  EarnedCoinsBreakdown,
  FraudAdjustmentEntry,
  RecentRewardActivity,
  Wallet,
  WalletRedemptionEntry,
  WalletStatus,
  WalletTimelineEntry,
  WalletTransaction,
  WalletUserType,
} from '@/types/wallet'
import { mockDealers } from '@/features/dealers/mockDealers'
import { mockChemists } from '@/features/chemists/mockChemists'
import { mrs } from '@/features/partners/mockPartnerData'
import { mockGifts, giftCategoryOptions } from '@/features/schemes/mockGifts'
import { mockSeasonalSchemes } from '@/features/schemes/mockSchemes'

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function dateFromSeed(seed: number, month = 'Jul'): string {
  const day = (seed % 27) + 1
  return `${pad(day)} ${month} 2026`
}

function timeFromSeed(seed: number): string {
  return `${pad(seededNumber(seed, 8, 20))}:${pad(seededNumber(seed + 1, 0, 59))}`
}

function buildTransactions(seed: number, walletId: string, startBalance: number): WalletTransaction[] {
  const sources: WalletTransaction['transactionSource'][] = ['Product Scan', 'Scheme Reward', 'Manual Adjustment', 'Redemption', 'Referral Program', 'Promotional Campaign']
  const count = seededNumber(seed, 5, 12)
  let balance = startBalance
  const reviewer = mrs[seed % mrs.length]!

  return Array.from({ length: count }).map((_, i) => {
    const localSeed = seed * 13 + i
    const type: WalletTransaction['transactionType'] = localSeed % 3 === 0 ? 'debit' : 'credit'
    const amount = seededNumber(localSeed, 20, 500)
    const previousBalance = balance
    balance = type === 'credit' ? balance + amount : Math.max(0, balance - amount)

    return {
      id: `${walletId}-txn-${i}`,
      transactionDate: dateFromSeed(localSeed, 'Jul'),
      transactionType: type,
      previousBalance,
      coinsAdjusted: type === 'credit' ? amount : -amount,
      updatedBalance: balance,
      transactionSource: sources[localSeed % sources.length]!,
      reason: type === 'credit' ? 'Reward points credited' : 'Redemption deduction',
      referenceNumber: `REF-${100000 + localSeed}`,
      performedBy: type === 'debit' && localSeed % 4 === 0 ? reviewer : 'System',
      status: localSeed % 15 === 0 ? 'reversed' : 'completed',
    }
  })
}

function buildRedemptionHistory(seed: number, walletId: string): WalletRedemptionEntry[] {
  const count = seededNumber(seed, 2, 6)
  const statuses: WalletRedemptionEntry['redemptionStatus'][] = ['pending', 'approved', 'shipped', 'delivered', 'delivered', 'cancelled']
  const couriers = ['BlueDart', 'Delhivery', 'DTDC', 'India Post']

  return Array.from({ length: count }).map((_, i) => {
    const localSeed = seed * 17 + i
    const gift = mockGifts[localSeed % mockGifts.length]!
    const status = statuses[localSeed % statuses.length]!
    const isShippedOrDelivered = status === 'shipped' || status === 'delivered'

    return {
      id: `${walletId}-redeem-${i}`,
      giftName: gift.giftName,
      category: gift.category,
      coinsRedeemed: gift.requiredCoins,
      requestDate: dateFromSeed(localSeed, 'Jun'),
      approvalDate: status === 'pending' ? null : dateFromSeed(localSeed + 2, 'Jun'),
      deliveryDate: status === 'delivered' ? dateFromSeed(localSeed + 5, 'Jul') : null,
      redemptionStatus: status,
      courierPartner: isShippedOrDelivered ? couriers[localSeed % couriers.length]! : null,
      trackingNumber: isShippedOrDelivered ? `TRK${1000000 + localSeed}` : null,
    }
  })
}

function buildEarnedCoinsBreakdown(seed: number): EarnedCoinsBreakdown {
  return {
    productScans: seededNumber(seed, 200, 3000),
    activeSchemes: seededNumber(seed + 1, 50, 1500),
    referralProgram: seededNumber(seed + 2, 0, 400),
    promotionalCampaigns: seededNumber(seed + 3, 0, 800),
    manualCredits: seededNumber(seed + 4, 0, 300),
  }
}

function buildRecentActivity(seed: number, walletId: string, userType: WalletUserType, dealerName: string, chemistName: string): RecentRewardActivity[] {
  const productNames = ['CardioCare 10mg', 'NeuroPlus 500mg', 'ImmunoBoost Syrup', 'GlucoBalance', 'PainRelief Gel']
  const scheme = mockSeasonalSchemes[seed % mockSeasonalSchemes.length]!
  const count = seededNumber(seed, 3, 8)

  return Array.from({ length: count }).map((_, i) => {
    const localSeed = seed * 19 + i
    return {
      id: `${walletId}-activity-${i}`,
      date: dateFromSeed(localSeed, 'Jul'),
      productName: productNames[localSeed % productNames.length]!,
      qrCode: `QR-${1000000 + localSeed}`,
      dealer: userType === 'Dealer' ? dealerName : '—',
      chemist: userType === 'Chemist' ? chemistName : '—',
      coinsEarned: seededNumber(localSeed, 5, 60),
      appliedScheme: scheme.schemeName,
      status: localSeed % 12 === 0 ? 'pending' : localSeed % 25 === 0 ? 'failed' : 'credited',
    }
  })
}

function buildTimeline(seed: number, walletId: string): WalletTimelineEntry[] {
  const activities: WalletTimelineEntry['activity'][] = [
    'Reward Points Earned',
    'Scheme Reward',
    'Manual Coin Adjustment',
    'Redemption Request',
    'Admin Action',
  ]
  return activities.map((activity, i) => ({
    id: `${walletId}-tl-${i}`,
    activity,
    dateTime: dateFromSeed(seed + i * 2, 'Jul'),
  }))
}

function buildFraudLog(seed: number, walletId: string): FraudAdjustmentEntry[] {
  if (seed % 6 !== 0) return []
  const reviewer = mrs[seed % mrs.length]!
  return [
    {
      id: `${walletId}-fraud-0`,
      incidentId: `INC-${20260000 + seed}`,
      coinsAdjusted: -seededNumber(seed, 50, 300),
      adjustmentReason: 'Duplicate scan detected outside geo-fence',
      actionTaken: 'Coins reversed and wallet flagged for review',
      performedBy: reviewer,
      dateTime: `${dateFromSeed(seed, 'Jun')} ${timeFromSeed(seed)}`,
    },
  ]
}

function buildWallet(seed: number): Wallet {
  const userType: WalletUserType = seed % 2 === 0 ? 'Dealer' : 'Chemist'
  const partner = userType === 'Dealer' ? mockDealers[seed % mockDealers.length]! : mockChemists[seed % mockChemists.length]!
  const id = `wallet-${seed}`
  const status: WalletStatus = seed % 15 === 0 ? 'suspended' : seed % 9 === 0 ? 'inactive' : 'active'

  const availableBalance = seededNumber(seed, 200, 15000)
  const lifetimeEarned = availableBalance + seededNumber(seed + 1, 500, 20000)
  const lifetimeRedeemed = lifetimeEarned - availableBalance
  const manualAdjustments = seededNumber(seed + 2, -200, 500)
  const pendingRedemptionCoins = seededNumber(seed + 3, 0, 2000)

  const dealerName = mockDealers[seed % mockDealers.length]!.shopName
  const chemistName = mockChemists[seed % mockChemists.length]!.shopName

  return {
    id,
    userId: partner.id,
    userName: partner.shopName,
    userType,
    mobileNumber: partner.phone,
    email: partner.email,
    region: partner.zone,
    registrationDate: dateFromSeed(seed, 'Jan'),
    status,

    availableBalance,
    lifetimeEarned,
    lifetimeRedeemed,
    manualAdjustments,
    pendingRedemptionCoins,
    lastUpdated: `${dateFromSeed(seed + 6, 'Jul')} ${timeFromSeed(seed)}`,

    transactions: buildTransactions(seed, id, availableBalance),
    redemptionHistory: buildRedemptionHistory(seed, id),
    earnedCoinsBreakdown: buildEarnedCoinsBreakdown(seed),
    recentActivity: buildRecentActivity(seed, id, userType, dealerName, chemistName),
    timeline: buildTimeline(seed, id),
    fraudLog: buildFraudLog(seed, id),
    internalNotes: status === 'suspended' ? 'Wallet suspended pending fraud investigation.' : 'No open issues on this wallet.',
  }
}

export const mockWallets: Wallet[] = Array.from({ length: 40 }).map((_, index) => buildWallet(index + 1))

export function getWalletById(id: string): Wallet | undefined {
  return mockWallets.find((wallet) => wallet.id === id)
}

export const walletKpis = {
  totalWalletBalance: mockWallets.reduce((sum, w) => sum + w.availableBalance, 0),
  totalCoinsEarned: mockWallets.reduce((sum, w) => sum + w.lifetimeEarned, 0),
  totalCoinsRedeemed: mockWallets.reduce((sum, w) => sum + w.lifetimeRedeemed, 0),
  pendingRedemptions: mockWallets.reduce((sum, w) => sum + w.pendingRedemptionCoins, 0),
}

export { giftCategoryOptions as walletGiftCategoryOptions }
