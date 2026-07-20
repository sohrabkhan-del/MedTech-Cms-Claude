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
} from '@/features/wallets/mockCoinRules'
import type { CoinValueRule } from '@/features/rewardsWallet/types/rewardsWallet.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// coin value rules API is available. setBaseCoinValue is currently a no-op
// resolving immediately so the UI/hook contract is stable ahead of time.
// Region multiplier persistence still uses the localStorage-backed mock
// helpers below — that is mock persistence, not a page/hook touching mocks.

async function getCoinRules(): Promise<CoinValueRule[]> {
  return Promise.resolve(mockCoinValueRules)
}

async function getCoinRuleDetail(id: string): Promise<CoinValueRule | undefined> {
  return Promise.resolve(getCoinValueRuleById(id))
}

async function getCoinRuleKpis() {
  return Promise.resolve(coinRuleKpis)
}

async function getCoinDistributionByCategory() {
  return Promise.resolve(coinDistributionByCategory)
}

function getHighestCurrentPoints(rule: CoinValueRule): number {
  return highestCurrentPoints(rule)
}

async function getRegionMultipliers(): Promise<RegionMultiplierMap> {
  return Promise.resolve(getStoredMultipliers())
}

async function saveRegionMultipliers(value: RegionMultiplierMap): Promise<void> {
  storeMultipliers(value)
  return Promise.resolve()
}

async function getRegionMultiplierDates(): Promise<RegionDateMap> {
  return Promise.resolve(getStoredMultiplierDates())
}

async function saveRegionMultiplierDates(value: RegionDateMap): Promise<void> {
  storeMultiplierDates(value)
  return Promise.resolve()
}

function getChangeDate(): string {
  return formatRuleChangeDate()
}

async function getRegionMultiplierDefaults() {
  return Promise.resolve(regionMultiplierDefaults)
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
