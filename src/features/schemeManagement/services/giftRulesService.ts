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

// TODO: replace mock-backed implementations with apiClient calls once the
// gift rules API is available. create/update/setActive/deleteRule are
// currently no-ops resolving immediately so the UI/hook contract is stable
// ahead of time.

async function getPermanentCatalogRewards(): Promise<RewardRule[]> {
  return Promise.resolve(mockPermanentCatalogRewards)
}

async function getSchemeTrackRewards(): Promise<RewardRule[]> {
  return Promise.resolve(mockSchemeTrackRewards)
}

async function getRewardRuleDetail(id: string): Promise<RewardRule | undefined> {
  return Promise.resolve(getRewardRuleById(id))
}

async function getGiftRulesDashboard() {
  return Promise.resolve({ ...giftRulesDashboard, currentActiveScheme })
}

async function getGiftRuleFormOptions() {
  return Promise.resolve({ rewardTrackOptions, ruleTypeOptions, schemeNameOptions })
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
