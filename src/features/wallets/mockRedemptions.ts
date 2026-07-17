import type {
  RedemptionDeliveryStatus,
  RedemptionHistoryEntry,
  RedemptionRequest,
  RedemptionStatus,
  RedemptionTimelineEntry,
  RedemptionUserType,
} from '@/types/redemption'
import { mockDealers } from '@/features/dealers/mockDealers'
import { mockChemists } from '@/features/chemists/mockChemists'
import { mrs } from '@/features/partners/mockPartnerData'
import { mockGifts } from '@/features/schemes/mockGifts'

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

function resolveStatus(seed: number): RedemptionStatus {
  const roll = seed % 10
  if (roll < 3) return 'pending'
  if (roll < 8) return 'completed'
  if (roll < 9) return 'approved'
  return 'rejected'
}

function resolveDeliveryStatus(seed: number, status: RedemptionStatus): RedemptionDeliveryStatus {
  if (status === 'pending' || status === 'rejected') return 'pending'
  const options: RedemptionDeliveryStatus[] = ['packed', 'shipped', 'delivered', 'delivered']
  return status === 'completed' ? options[seed % options.length]! : 'pending'
}

function buildTimeline(seed: number, requestId: string, status: RedemptionStatus, deliveryStatus: RedemptionDeliveryStatus): RedemptionTimelineEntry[] {
  const timeline: RedemptionTimelineEntry[] = [
    { id: `${requestId}-tl-0`, activity: 'Redemption Request Created', dateTime: dateFromSeed(seed, 'Jun') },
    { id: `${requestId}-tl-1`, activity: 'Pending Approval', dateTime: dateFromSeed(seed + 1, 'Jun') },
  ]
  if (status === 'rejected') {
    timeline.push({ id: `${requestId}-tl-2`, activity: 'Rejected by Admin', dateTime: dateFromSeed(seed + 2, 'Jun') })
    return timeline
  }
  if (status === 'pending') return timeline

  timeline.push({ id: `${requestId}-tl-2`, activity: 'Approved by Admin', dateTime: dateFromSeed(seed + 2, 'Jun') })
  if (deliveryStatus === 'packed' || deliveryStatus === 'shipped' || deliveryStatus === 'delivered') {
    timeline.push({ id: `${requestId}-tl-3`, activity: 'Packed', dateTime: dateFromSeed(seed + 3, 'Jun') })
  }
  if (deliveryStatus === 'shipped' || deliveryStatus === 'delivered') {
    timeline.push({ id: `${requestId}-tl-4`, activity: 'Shipped', dateTime: dateFromSeed(seed + 4, 'Jul') })
  }
  if (deliveryStatus === 'delivered') {
    timeline.push({ id: `${requestId}-tl-5`, activity: 'Delivered', dateTime: dateFromSeed(seed + 5, 'Jul') })
  }
  if (status === 'completed') {
    timeline.push({ id: `${requestId}-tl-6`, activity: 'Completed', dateTime: dateFromSeed(seed + 6, 'Jul') })
  }
  return timeline
}

function buildHistory(seed: number, requestId: string, userSeed: number): RedemptionHistoryEntry[] {
  const count = seededNumber(seed, 2, 5)
  const reviewer = mrs[seed % mrs.length]!
  return Array.from({ length: count }).map((_, i) => {
    const localSeed = userSeed * 23 + i
    const gift = mockGifts[localSeed % mockGifts.length]!
    const status = resolveStatus(localSeed)
    return {
      id: `${requestId}-hist-${i}`,
      rewardItem: gift.giftName,
      coinsUsed: gift.requiredCoins,
      requestDate: dateFromSeed(localSeed, 'May'),
      approvalDate: status === 'pending' ? null : dateFromSeed(localSeed + 1, 'May'),
      deliveryDate: status === 'completed' ? dateFromSeed(localSeed + 4, 'Jun') : null,
      status,
      approvedBy: status === 'pending' ? null : reviewer,
    }
  })
}

function buildRedemptionRequest(seed: number): RedemptionRequest {
  const id = `redeem-req-${seed}`
  const userType: RedemptionUserType = seed % 2 === 0 ? 'Dealer' : 'Chemist'
  const partner = userType === 'Dealer' ? mockDealers[seed % mockDealers.length]! : mockChemists[seed % mockChemists.length]!
  const gift = mockGifts[seed % mockGifts.length]!
  const status = resolveStatus(seed)
  const deliveryStatus = resolveDeliveryStatus(seed, status)
  const reviewer = mrs[seed % mrs.length]!

  const currentWalletBalance = seededNumber(seed, 500, 15000)
  const walletBalanceAfterRedemption = Math.max(0, currentWalletBalance - gift.requiredCoins)

  return {
    id,
    userId: partner.id,
    userName: partner.shopName,
    userType,
    mobileNumber: partner.phone,
    email: partner.email,
    region: partner.zone,
    registrationDate: dateFromSeed(seed, 'Jan'),

    rewardItem: gift.giftName,
    rewardCategory: gift.category,
    quantity: 1,
    coinsUsed: gift.requiredCoins,
    requestDate: dateFromSeed(seed, 'Jul'),
    expectedDeliveryDate: dateFromSeed(seed + 7, 'Jul'),

    currentWalletBalance,
    walletBalanceAfterRedemption,

    redemptionStatus: status,
    approvedBy: status === 'pending' ? null : reviewer,
    deliveryStatus,

    transactionId: `TXN-${300000 + seed}`,
    transactionDate: dateFromSeed(seed, 'Jul'),
    transactionStatus: status === 'rejected' ? 'reversed' : status === 'pending' ? 'pending' : 'completed',

    timeline: buildTimeline(seed, id, status, deliveryStatus),
    history: buildHistory(seed, id, seed),
    internalNotes: status === 'rejected' ? 'Rejected due to insufficient wallet balance verification.' : 'No special handling required.',
  }
}

export const mockRedemptionRequests: RedemptionRequest[] = Array.from({ length: 34 }).map((_, index) => buildRedemptionRequest(index + 1))

export function getRedemptionRequestById(id: string): RedemptionRequest | undefined {
  return mockRedemptionRequests.find((request) => request.id === id)
}

export const redemptionKpis = {
  totalRequests: mockRedemptionRequests.length,
  pendingApprovals: mockRedemptionRequests.filter((r) => r.redemptionStatus === 'pending').length,
  completedRedemptions: mockRedemptionRequests.filter((r) => r.redemptionStatus === 'completed').length,
  coinsRedeemed: mockRedemptionRequests.reduce((sum, r) => sum + r.coinsUsed, 0),
}
