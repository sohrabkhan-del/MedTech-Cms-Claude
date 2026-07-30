import {
  mockRedemptionRequests,
  getRedemptionRequestById,
  getRedemptionRequestsByUserId,
  redemptionKpis,
} from '@/features/rewardsWallet/mockRedemptions'
import { giftCategoryOptions } from '@/features/schemeManagement/mockGifts'
import { getSchemeById } from '@/features/schemeManagement/mockSchemes'
import type {
  RedemptionRequest,
  RedemptionStatus,
  RedemptionDeliveryStatus,
} from '@/features/rewardsWallet/types/rewardsWallet.types'
import type { SchemeApplicableProduct } from '@/types/scheme'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// redemptions API is available. setStatus/setDeliveryStatus are currently
// no-ops resolving immediately so the UI/hook contract is stable ahead of time.

/**
 * TODO: wire into the real Points ledger once it exists.
 *
 * Rule: a Seasonal scheme is a walled-off Points bucket. Points a partner earns
 * after enrolling in a seasonal scheme can only be redeemed against gift products
 * attached to THAT SAME seasonal scheme — they never fall back to (or combine with)
 * the partner's general Points pool. A General scheme has no such restriction: its
 * Points behave like the partner's normal, unrestricted balance.
 *
 * When the ledger is implemented, every redemption must resolve which bucket it is
 * drawing from — `schemeId: null` (general pool) or a specific seasonal `schemeId` —
 * and this function is where that source-scheme check belongs:
 *   1. If `sourceSchemeId` is a seasonal scheme, the target product must be one of
 *      that scheme's attached products (`Scheme.products[].productId`), and the
 *      Points spent must come only from that scheme's earned balance.
 *   2. If `sourceSchemeId` is null/general (or a general scheme), normal unrestricted
 *      redemption applies.
 */
function canRedeemFromScheme(
  sourceSchemeId: string | null,
  productId: string,
): boolean {
  if (!sourceSchemeId) return true
  const scheme = getSchemeById(sourceSchemeId)
  if (!scheme) return true
  if (scheme.type !== 'seasonal') return true
  return scheme.applicableProducts.some(
    (p: SchemeApplicableProduct) => p.productId === productId,
  )
}

async function getRedemptions(): Promise<RedemptionRequest[]> {
  return mockDelay(mockRedemptionRequests)
}

async function getRedemptionDetail(
  id: string,
): Promise<RedemptionRequest | undefined> {
  return mockDelay(getRedemptionRequestById(id))
}

async function getRedemptionsByUserId(
  userId: string,
): Promise<RedemptionRequest[]> {
  return mockDelay(getRedemptionRequestsByUserId(userId))
}

async function getRedemptionKpis() {
  return mockDelay(redemptionKpis)
}

async function getRedemptionFormOptions() {
  return mockDelay({ rewardCategoryOptions: giftCategoryOptions })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setRedemptionStatus(
  _id: string,
  _status: RedemptionStatus,
): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setDeliveryStatus(
  _id: string,
  _status: RedemptionDeliveryStatus,
): Promise<void> {
  return Promise.resolve()
}

export const redemptionsService = {
  getRedemptions,
  getRedemptionDetail,
  getRedemptionsByUserId,
  getRedemptionKpis,
  getRedemptionFormOptions,
  setRedemptionStatus,
  setDeliveryStatus,
  canRedeemFromScheme,
}
