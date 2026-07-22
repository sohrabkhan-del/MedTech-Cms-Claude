import { mockRedemptionRequests, getRedemptionRequestById, redemptionKpis } from '@/features/rewardsWallet/mockRedemptions'
import { giftCategoryOptions } from '@/features/schemeManagement/mockGifts'
import type {
  RedemptionRequest,
  RedemptionStatus,
  RedemptionDeliveryStatus,
} from '@/features/rewardsWallet/types/rewardsWallet.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// redemptions API is available. setStatus/setDeliveryStatus are currently
// no-ops resolving immediately so the UI/hook contract is stable ahead of time.

async function getRedemptions(): Promise<RedemptionRequest[]> {
  return mockDelay(mockRedemptionRequests)
}

async function getRedemptionDetail(id: string): Promise<RedemptionRequest | undefined> {
  return mockDelay(getRedemptionRequestById(id))
}

async function getRedemptionKpis() {
  return mockDelay(redemptionKpis)
}

async function getRedemptionFormOptions() {
  return mockDelay({ rewardCategoryOptions: giftCategoryOptions })
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
