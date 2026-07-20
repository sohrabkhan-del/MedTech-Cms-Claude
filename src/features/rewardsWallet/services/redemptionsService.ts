import { mockRedemptionRequests, getRedemptionRequestById, redemptionKpis } from '@/features/wallets/mockRedemptions'
import { giftCategoryOptions } from '@/features/schemes/mockGifts'
import type {
  RedemptionRequest,
  RedemptionStatus,
  RedemptionDeliveryStatus,
} from '@/features/rewardsWallet/types/rewardsWallet.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// redemptions API is available. setStatus/setDeliveryStatus are currently
// no-ops resolving immediately so the UI/hook contract is stable ahead of time.

async function getRedemptions(): Promise<RedemptionRequest[]> {
  return Promise.resolve(mockRedemptionRequests)
}

async function getRedemptionDetail(id: string): Promise<RedemptionRequest | undefined> {
  return Promise.resolve(getRedemptionRequestById(id))
}

async function getRedemptionKpis() {
  return Promise.resolve(redemptionKpis)
}

async function getRedemptionFormOptions() {
  return Promise.resolve({ rewardCategoryOptions: giftCategoryOptions })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setRedemptionStatus(_id: string, _status: RedemptionStatus): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setDeliveryStatus(_id: string, _status: RedemptionDeliveryStatus): Promise<void> {
  return Promise.resolve()
}

export const redemptionsService = {
  getRedemptions,
  getRedemptionDetail,
  getRedemptionKpis,
  getRedemptionFormOptions,
  setRedemptionStatus,
  setDeliveryStatus,
}
