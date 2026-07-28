import {
  mockCoinValueRules,
  getCoinValueRuleById,
  highestCurrentPoints,
  regionMultiplierDefaults,
  coinRuleKpis,
  coinDistributionByCategory,
  getStoredMultipliers,
  storeMultipliers,
  getStoredMultiplierDates,
  storeMultiplierDates,
  formatRuleChangeDate,
  formatRuleChangeTimestamp,
  getStoredRuleStatuses,
  storeRuleStatuses,
  groupCoinValueRulesByProduct,
  appendRegionHistoryEntries,
  type RegionMultiplierMap,
  type RegionDateMap,
  type RuleStatusMap,
  type ProductCoinRuleGroup,
} from '@/features/rewardsWallet/mockCoinRules'
import type { CoinRulePartnerType, CoinValueRule, RegionCoinHistoryEntry } from '@/features/rewardsWallet/types/rewardsWallet.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// coin value rules API is available. setBaseCoinValue is currently a no-op
// resolving immediately so the UI/hook contract is stable ahead of time.
// Region multiplier persistence still uses the localStorage-backed mock
// helpers below — that is mock persistence, not a page/hook touching mocks.

async function getCoinRules(): Promise<CoinValueRule[]> {
  return mockDelay(mockCoinValueRules)
}

async function getCoinRuleDetail(id: string): Promise<CoinValueRule | undefined> {
  return mockDelay(getCoinValueRuleById(id))
}

async function getSiblingCoinRule(
  modelCode: string,
  partnerType: CoinRulePartnerType,
): Promise<CoinValueRule | undefined> {
  const group = groupCoinValueRulesByProduct(mockCoinValueRules).find(
    (g) => g.modelCode === modelCode,
  )
  const sibling = partnerType === 'Dealer' ? group?.dealerRule : group?.chemistRule
  return mockDelay(sibling ? getCoinValueRuleById(sibling.id) : undefined)
}

async function getCoinRuleKpis() {
  return mockDelay(coinRuleKpis)
}

async function getCoinDistributionByCategory() {
  return mockDelay(coinDistributionByCategory)
}

function getHighestCurrentPoints(rule: CoinValueRule): number {
  return highestCurrentPoints(rule)
}

async function getRegionMultipliers(): Promise<RegionMultiplierMap> {
  return mockDelay(getStoredMultipliers())
}

async function saveRegionMultipliers(value: RegionMultiplierMap): Promise<void> {
  storeMultipliers(value)
  return Promise.resolve()
}

async function getRegionMultiplierDates(): Promise<RegionDateMap> {
  return mockDelay(getStoredMultiplierDates())
}

async function saveRegionMultiplierDates(value: RegionDateMap): Promise<void> {
  storeMultiplierDates(value)
  return Promise.resolve()
}

function getChangeDate(): string {
  return formatRuleChangeDate()
}

function getChangeTimestamp(): string {
  return formatRuleChangeTimestamp()
}

async function getRegionMultiplierDefaults() {
  return mockDelay(regionMultiplierDefaults)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setBaseCoinValue(_id: string, _baseCoinValue: number): Promise<void> {
  return Promise.resolve()
}

async function getProductRuleGroups(): Promise<ProductCoinRuleGroup[]> {
  return mockDelay(groupCoinValueRulesByProduct(mockCoinValueRules))
}

async function getRuleStatuses(): Promise<RuleStatusMap> {
  return mockDelay(getStoredRuleStatuses())
}

async function saveRuleStatuses(value: RuleStatusMap): Promise<void> {
  storeRuleStatuses(value)
  return Promise.resolve()
}

async function saveRegionHistoryEntries(
  entries: Record<string, RegionCoinHistoryEntry[]>,
): Promise<void> {
  appendRegionHistoryEntries(entries)
  return Promise.resolve()
}

export const coinRulesService = {
  getCoinRules,
  getCoinRuleDetail,
  getSiblingCoinRule,
  getCoinRuleKpis,
  getCoinDistributionByCategory,
  getHighestCurrentPoints,
  getRegionMultipliers,
  saveRegionMultipliers,
  getRegionMultiplierDates,
  saveRegionMultiplierDates,
  getChangeDate,
  getChangeTimestamp,
  getRegionMultiplierDefaults,
  setBaseCoinValue,
  getProductRuleGroups,
  getRuleStatuses,
  saveRuleStatuses,
  saveRegionHistoryEntries,
}

export type { RegionMultiplierMap, RegionDateMap, RuleStatusMap, ProductCoinRuleGroup }
