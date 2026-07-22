import {
  mockPermanentCatalogRewards,
  mockSchemeTrackRewards,
  getRewardRuleById,
  currentActiveScheme,
  giftRulesDashboard,
  rewardTrackOptions,
  ruleTypeOptions,
  schemeNameOptions,
} from '@/features/schemeManagement/mockGiftRules'
import type { RewardRule, GiftRuleFormValues } from '@/features/schemeManagement/types/schemeManagement.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// gift rules API is available. create/update/setActive/deleteRule are
// currently no-ops resolving immediately so the UI/hook contract is stable
// ahead of time.

async function getPermanentCatalogRewards(): Promise<RewardRule[]> {
  return mockDelay(mockPermanentCatalogRewards)
}

async function getSchemeTrackRewards(): Promise<RewardRule[]> {
  return mockDelay(mockSchemeTrackRewards)
}

async function getRewardRuleDetail(id: string): Promise<RewardRule | undefined> {
  return mockDelay(getRewardRuleById(id))
}

async function getGiftRulesDashboard() {
  return mockDelay({ ...giftRulesDashboard, currentActiveScheme })
}

async function getGiftRuleFormOptions() {
  return mockDelay({ rewardTrackOptions, ruleTypeOptions, schemeNameOptions })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function createRewardRule(_values: GiftRuleFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function updateRewardRule(_id: string, _values: GiftRuleFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setRewardRuleActive(_id: string, _active: boolean): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function deleteRewardRule(_id: string): Promise<void> {
  return Promise.resolve()
}

export const giftRulesService = {
  getPermanentCatalogRewards,
  getSchemeTrackRewards,
  getRewardRuleDetail,
  getGiftRulesDashboard,
  getGiftRuleFormOptions,
  createRewardRule,
  updateRewardRule,
  setRewardRuleActive,
  deleteRewardRule,
}
