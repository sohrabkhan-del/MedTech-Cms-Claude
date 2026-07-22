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
  type RegionMultiplierMap,
  type RegionDateMap,
} from '@/features/rewardsWallet/mockCoinRules'
import type { CoinValueRule } from '@/features/rewardsWallet/types/rewardsWallet.types'
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

async function getRegionMultiplierDefaults() {
  return mockDelay(regionMultiplierDefaults)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setBaseCoinValue(_id: string, _baseCoinValue: number): Promise<void> {
  return Promise.resolve()
}

export const coinRulesService = {
  getCoinRules,
  getCoinRuleDetail,
  getCoinRuleKpis,
  getCoinDistributionByCategory,
  getHighestCurrentPoints,
  getRegionMultipliers,
  saveRegionMultipliers,
  getRegionMultiplierDates,
  saveRegionMultiplierDates,
  getChangeDate,
  getRegionMultiplierDefaults,
  setBaseCoinValue,
}

export type { RegionMultiplierMap, RegionDateMap }
