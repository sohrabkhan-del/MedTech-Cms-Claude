import {
  mockPointValueRules,
  getPointValueRuleById,
  highestCurrentPoints,
  regionMultiplierDefaults,
  PointRuleKpis,
  PointDistributionByCategory,
  getStoredMultipliers,
  storeMultipliers,
  getStoredMultiplierDates,
  storeMultiplierDates,
  formatRuleChangeDate,
  formatRuleChangeTimestamp,
  getStoredRuleStatuses,
  storeRuleStatuses,
  groupPointValueRulesByProduct,
  appendRegionHistoryEntries,
  type RegionMultiplierMap,
  type RegionDateMap,
  type RuleStatusMap,
  type ProductPointRuleGroup,
} from '@/features/rewardsWallet/mockPointRules'
import type {
  PointRulePartnerType,
  PointValueRule,
  RegionPointHistoryEntry,
} from '@/features/rewardsWallet/types/rewardsWallet.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// Point value rules API is available. setBasePointValue is currently a no-op
// resolving immediately so the UI/hook contract is stable ahead of time.
// Region multiplier persistence still uses the localStorage-backed mock
// helpers below — that is mock persistence, not a page/hook touching mocks.

async function getPointRules(): Promise<PointValueRule[]> {
  return mockDelay(mockPointValueRules)
}

async function getPointRuleDetail(
  id: string,
): Promise<PointValueRule | undefined> {
  return mockDelay(getPointValueRuleById(id))
}

async function getSiblingPointRule(
  modelCode: string,
  partnerType: PointRulePartnerType,
): Promise<PointValueRule | undefined> {
  const group = groupPointValueRulesByProduct(mockPointValueRules).find(
    (g) => g.modelCode === modelCode,
  )
  const sibling =
    partnerType === 'Dealer' ? group?.dealerRule : group?.chemistRule
  return mockDelay(sibling ? getPointValueRuleById(sibling.id) : undefined)
}

async function getPointRuleKpis() {
  return mockDelay(PointRuleKpis)
}

async function getPointDistributionByCategory() {
  return mockDelay(PointDistributionByCategory)
}

function getHighestCurrentPoints(rule: PointValueRule): number {
  return highestCurrentPoints(rule)
}

async function getRegionMultipliers(): Promise<RegionMultiplierMap> {
  return mockDelay(getStoredMultipliers())
}

async function saveRegionMultipliers(
  value: RegionMultiplierMap,
): Promise<void> {
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
async function setBasePointValue(
  _id: string,
  _basePointValue: number,
): Promise<void> {
  return Promise.resolve()
}

async function getProductRuleGroups(): Promise<ProductPointRuleGroup[]> {
  return mockDelay(groupPointValueRulesByProduct(mockPointValueRules))
}

async function getRuleStatuses(): Promise<RuleStatusMap> {
  return mockDelay(getStoredRuleStatuses())
}

async function saveRuleStatuses(value: RuleStatusMap): Promise<void> {
  storeRuleStatuses(value)
  return Promise.resolve()
}

async function saveRegionHistoryEntries(
  entries: Record<string, RegionPointHistoryEntry[]>,
): Promise<void> {
  appendRegionHistoryEntries(entries)
  return Promise.resolve()
}

export const PointRulesService = {
  getPointRules,
  getPointRuleDetail,
  getSiblingPointRule,
  getPointRuleKpis,
  getPointDistributionByCategory,
  getHighestCurrentPoints,
  getRegionMultipliers,
  saveRegionMultipliers,
  getRegionMultiplierDates,
  saveRegionMultiplierDates,
  getChangeDate,
  getChangeTimestamp,
  getRegionMultiplierDefaults,
  setBasePointValue,
  getProductRuleGroups,
  getRuleStatuses,
  saveRuleStatuses,
  saveRegionHistoryEntries,
}

export type {
  RegionMultiplierMap,
  RegionDateMap,
  RuleStatusMap,
  ProductPointRuleGroup,
}
