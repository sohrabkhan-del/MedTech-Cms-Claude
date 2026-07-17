import type { CoinRuleRegion, CoinValueRule, RegionCoinHistoryEntry, RegionMultiplierRow } from '@/types/coinRule'
import { mockProducts } from '@/features/inventory/mockProducts'
import { mrs } from '@/features/partners/mockPartnerData'

const REGIONS: CoinRuleRegion[] = ['North', 'South', 'East', 'West']

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

function timeFromSeed(seed: number): string {
  return `${pad(seededNumber(seed, 8, 20))}:${pad(seededNumber(seed + 1, 0, 59))}`
}

function multiplierFromSeed(seed: number): number {
  return Number((1 + (seed % 6) * 0.15).toFixed(2))
}

function buildRegionRows(seed: number, baseCoinValue: number): RegionMultiplierRow[] {
  return REGIONS.map((region, i) => {
    const localSeed = seed * 7 + i
    const previousMultiplier = multiplierFromSeed(localSeed)
    const currentMultiplier = multiplierFromSeed(localSeed + 3)
    return {
      region,
      previousMultiplier,
      currentMultiplier,
      previousPoints: Math.round(baseCoinValue * previousMultiplier),
      previousEffectiveDate: dateFromSeed(localSeed, 'May'),
      currentPoints: Math.round(baseCoinValue * currentMultiplier),
      currentEffectiveDate: dateFromSeed(localSeed + 10, 'Jul'),
    }
  })
}

function buildRegionalHistory(seed: number, ruleId: string, rows: RegionMultiplierRow[]): RegionCoinHistoryEntry[] {
  const reviewer = mrs[seed % mrs.length]!
  return rows.map((row, i) => ({
    id: `${ruleId}-region-${row.region}`,
    region: row.region,
    previousMultiplier: row.previousMultiplier,
    currentMultiplier: row.currentMultiplier,
    previousRewardPoints: row.previousPoints,
    previousEffectiveDate: row.previousEffectiveDate,
    currentRewardPoints: row.currentPoints,
    currentEffectiveDate: row.currentEffectiveDate,
    changedBy: reviewer,
    changedAt: `${dateFromSeed(seed + i, 'Jul')} ${timeFromSeed(seed + i)}`,
  }))
}

function buildCoinValueRule(seed: number): CoinValueRule {
  const product = mockProducts[seed % mockProducts.length]!
  const id = `coin-rule-${seed}`
  const baseCoinValue = seededNumber(seed, 10, 60)
  const regions = buildRegionRows(seed, baseCoinValue)
  const reviewer = mrs[seed % mrs.length]!

  return {
    id,
    modelCode: product.productCode,
    productCategory: product.productCategory,
    productName: product.productName,
    defaultCoinValue: baseCoinValue,
    baseCoinValue,

    regions,
    regionalHistory: buildRegionalHistory(seed, id, regions),

    lastModifiedBy: reviewer,
    lastUpdatedTime: `${dateFromSeed(seed + 12, 'Jul')} ${timeFromSeed(seed)}`,
  }
}

export const mockCoinValueRules: CoinValueRule[] = mockProducts.slice(0, 30).map((_, index) => buildCoinValueRule(index + 1))

export function getCoinValueRuleById(id: string): CoinValueRule | undefined {
  return mockCoinValueRules.find((rule) => rule.id === id)
}

export function highestCurrentPoints(rule: CoinValueRule): number {
  return Math.max(...rule.regions.map((r) => r.currentPoints))
}

export const regionMultiplierDefaults: Record<CoinRuleRegion, number> = {
  North: Number((mockCoinValueRules.reduce((sum, r) => sum + (r.regions.find((x) => x.region === 'North')?.currentMultiplier ?? 1), 0) / mockCoinValueRules.length).toFixed(2)),
  South: Number((mockCoinValueRules.reduce((sum, r) => sum + (r.regions.find((x) => x.region === 'South')?.currentMultiplier ?? 1), 0) / mockCoinValueRules.length).toFixed(2)),
  East: Number((mockCoinValueRules.reduce((sum, r) => sum + (r.regions.find((x) => x.region === 'East')?.currentMultiplier ?? 1), 0) / mockCoinValueRules.length).toFixed(2)),
  West: Number((mockCoinValueRules.reduce((sum, r) => sum + (r.regions.find((x) => x.region === 'West')?.currentMultiplier ?? 1), 0) / mockCoinValueRules.length).toFixed(2)),
}

export const coinRuleKpis = {
  totalOutstandingCoinLiability: mockCoinValueRules.reduce((sum, r) => sum + r.regions.reduce((s, x) => s + x.currentPoints, 0), 0),
  totalConfiguredRules: mockCoinValueRules.length,
  averageBaseCoinValue: Math.round(mockCoinValueRules.reduce((sum, r) => sum + r.baseCoinValue, 0) / mockCoinValueRules.length),
}

export const coinDistributionByCategory = Object.entries(
  mockCoinValueRules.reduce<Record<string, number>>((acc, rule) => {
    const total = rule.regions.reduce((s, x) => s + x.currentPoints, 0)
    acc[rule.productCategory] = (acc[rule.productCategory] ?? 0) + total
    return acc
  }, {}),
).map(([category, value]) => ({ category, value }))

// --- localStorage persistence for region multiplier overrides (mock-only, session-local) ---

const MULTIPLIERS_KEY = 'medtech-cms:coin-rules:region-multipliers'
const MULTIPLIER_DATES_KEY = 'medtech-cms:coin-rules:region-multiplier-dates'

export type RegionMultiplierMap = Record<CoinRuleRegion, number>
export type RegionDateMap = Record<CoinRuleRegion, string>

export function formatRuleChangeDate(): string {
  const now = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${pad(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()}`
}

export function getStoredMultipliers(): RegionMultiplierMap {
  try {
    const raw = localStorage.getItem(MULTIPLIERS_KEY)
    if (raw) return JSON.parse(raw) as RegionMultiplierMap
  } catch {
    // localStorage unavailable — fall back to defaults
  }
  return { ...regionMultiplierDefaults }
}

export function storeMultipliers(value: RegionMultiplierMap): void {
  try {
    localStorage.setItem(MULTIPLIERS_KEY, JSON.stringify(value))
  } catch {
    // localStorage unavailable — change won't persist across reloads
  }
}

export function getStoredMultiplierDates(): RegionDateMap {
  try {
    const raw = localStorage.getItem(MULTIPLIER_DATES_KEY)
    if (raw) return JSON.parse(raw) as RegionDateMap
  } catch {
    // localStorage unavailable — fall back to defaults
  }
  const today = formatRuleChangeDate()
  return { North: today, South: today, East: today, West: today }
}

export function storeMultiplierDates(value: RegionDateMap): void {
  try {
    localStorage.setItem(MULTIPLIER_DATES_KEY, JSON.stringify(value))
  } catch {
    // localStorage unavailable — change won't persist across reloads
  }
}
