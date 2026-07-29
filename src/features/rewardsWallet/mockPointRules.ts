import type {
  PointRulePartnerType,
  PointRuleRegion,
  PointValueRule,
  RegionPointHistoryEntry,
  RegionMultiplierRow,
} from '@/types/PointRule'
import { mockProducts } from '@/features/inventoryManagement/mockProducts'
import { mrs } from '@/features/userManagement/mockPartnerData'

const REGIONS: PointRuleRegion[] = ['North', 'South', 'East', 'West']

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

/** Rounds to the nearest hundred, e.g. 245 -> 200, 260 -> 300. */
function roundToHundred(value: number): number {
  return Math.round(value / 100) * 100
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

function buildRegionRows(
  seed: number,
  basePointValue: number,
): RegionMultiplierRow[] {
  return REGIONS.map((region, i) => {
    const localSeed = seed * 7 + i
    const previousMultiplier = multiplierFromSeed(localSeed)
    const currentMultiplier = multiplierFromSeed(localSeed + 3)
    return {
      region,
      previousMultiplier,
      currentMultiplier,
      previousPoints: roundToHundred(basePointValue * previousMultiplier),
      previousEffectiveDate: dateFromSeed(localSeed, 'May'),
      currentPoints: roundToHundred(basePointValue * currentMultiplier),
      currentEffectiveDate: dateFromSeed(localSeed + 10, 'Jul'),
    }
  })
}

function buildRegionalHistory(
  seed: number,
  ruleId: string,
  rows: RegionMultiplierRow[],
): RegionPointHistoryEntry[] {
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

function buildPointValueRule(
  seed: number,
  partnerType: PointRulePartnerType,
): PointValueRule {
  const product = mockProducts[seed % mockProducts.length]!
  const id = `Point-rule-${partnerType.toLowerCase()}-${seed}`
  const basePointValue = roundToHundred(
    seededNumber(partnerType === 'Dealer' ? seed : seed + 500, 100, 1000),
  )
  const regions = buildRegionRows(seed, basePointValue)
  const reviewer = mrs[seed % mrs.length]!

  return {
    id,
    partnerType,
    modelCode: product.productCode,
    productCategory: product.productCategory,
    productName: product.productName,
    defaultPointValue: basePointValue,
    basePointValue,
    status: 'active',

    regions,
    regionalHistory: buildRegionalHistory(seed, id, regions),

    lastModifiedBy: reviewer,
    lastUpdatedTime: `${dateFromSeed(seed + 12, 'Jul')} ${timeFromSeed(seed)}`,
  }
}

export const mockPointValueRules: PointValueRule[] = [
  ...mockProducts
    .slice(0, 30)
    .map((_, index) => buildPointValueRule(index + 1, 'Dealer')),
  ...mockProducts
    .slice(0, 30)
    .map((_, index) => buildPointValueRule(index + 1, 'Chemist')),
]

export function getPointValueRuleById(id: string): PointValueRule | undefined {
  const rule = mockPointValueRules.find((rule) => rule.id === id)
  if (!rule) return undefined
  const extraHistory = getStoredRegionHistory()[id]
  if (!extraHistory?.length) return rule
  return {
    ...rule,
    regionalHistory: [...extraHistory, ...rule.regionalHistory],
  }
}

export function getPointValueRulesByPartnerType(
  partnerType: PointRulePartnerType,
): PointValueRule[] {
  return mockPointValueRules.filter((rule) => rule.partnerType === partnerType)
}

/** One row per product, pairing its Dealer and Chemist point value rules by product code. */
export interface ProductPointRuleGroup {
  modelCode: string
  productCategory: string
  productName: string
  dealerRule?: PointValueRule
  chemistRule?: PointValueRule
}

export function groupPointValueRulesByProduct(
  rules: PointValueRule[],
): ProductPointRuleGroup[] {
  const groups = new Map<string, ProductPointRuleGroup>()
  for (const rule of rules) {
    const existing = groups.get(rule.modelCode)
    const group: ProductPointRuleGroup = existing ?? {
      modelCode: rule.modelCode,
      productCategory: rule.productCategory,
      productName: rule.productName,
    }
    if (rule.partnerType === 'Dealer') group.dealerRule = rule
    else group.chemistRule = rule
    groups.set(rule.modelCode, group)
  }
  return Array.from(groups.values())
}

export function highestCurrentPoints(rule: PointValueRule): number {
  return Math.max(...rule.regions.map((r) => r.currentPoints))
}

function averageMultiplierFor(
  partnerType: PointRulePartnerType,
  region: PointRuleRegion,
): number {
  const rules = mockPointValueRules.filter((r) => r.partnerType === partnerType)
  return Number(
    (
      rules.reduce(
        (sum, r) =>
          sum +
          (r.regions.find((x) => x.region === region)?.currentMultiplier ?? 1),
        0,
      ) / rules.length
    ).toFixed(2),
  )
}

export const regionMultiplierDefaults: Record<
  PointRulePartnerType,
  Record<PointRuleRegion, number>
> = {
  Dealer: {
    North: averageMultiplierFor('Dealer', 'North'),
    South: averageMultiplierFor('Dealer', 'South'),
    East: averageMultiplierFor('Dealer', 'East'),
    West: averageMultiplierFor('Dealer', 'West'),
  },
  Chemist: {
    North: averageMultiplierFor('Chemist', 'North'),
    South: averageMultiplierFor('Chemist', 'South'),
    East: averageMultiplierFor('Chemist', 'East'),
    West: averageMultiplierFor('Chemist', 'West'),
  },
}

export const PointRuleKpis = {
  totalOutstandingPointLiability: mockPointValueRules.reduce(
    (sum, r) => sum + r.regions.reduce((s, x) => s + x.currentPoints, 0),
    0,
  ),
  totalConfiguredRules: mockPointValueRules.length,
  averageBasePointValue: Math.round(
    mockPointValueRules.reduce((sum, r) => sum + r.basePointValue, 0) /
      mockPointValueRules.length,
  ),
}

export const PointDistributionByCategory = Object.entries(
  mockPointValueRules.reduce<Record<string, number>>((acc, rule) => {
    const total = rule.regions.reduce((s, x) => s + x.currentPoints, 0)
    acc[rule.productCategory] = (acc[rule.productCategory] ?? 0) + total
    return acc
  }, {}),
).map(([category, value]) => ({ category, value }))

// --- localStorage persistence for region multiplier overrides (mock-only, session-local) ---

const MULTIPLIERS_KEY = 'medtech-cms:Point-rules:region-multipliers-v2'
const MULTIPLIER_DATES_KEY =
  'medtech-cms:Point-rules:region-multiplier-dates-v2'

export type RegionMultiplierMap = Record<
  PointRulePartnerType,
  Record<PointRuleRegion, number>
>
export type RegionDateMap = Record<
  PointRulePartnerType,
  Record<PointRuleRegion, string>
>

export function formatRuleChangeDate(): string {
  const now = new Date()
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${pad(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()}`
}

export function formatRuleChangeTimestamp(): string {
  const now = new Date()
  return `${formatRuleChangeDate()} ${pad(now.getHours())}:${pad(now.getMinutes())}`
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
  const defaultRegionDates: Record<PointRuleRegion, string> = {
    North: today,
    South: today,
    East: today,
    West: today,
  }
  return {
    Dealer: { ...defaultRegionDates },
    Chemist: { ...defaultRegionDates },
  }
}

export function storeMultiplierDates(value: RegionDateMap): void {
  try {
    localStorage.setItem(MULTIPLIER_DATES_KEY, JSON.stringify(value))
  } catch {
    // localStorage unavailable — change won't persist across reloads
  }
}

const RULE_STATUS_KEY = 'medtech-cms:Point-rules:status-overrides'

export type RuleStatusMap = Record<string, 'active' | 'inactive'>

export function getStoredRuleStatuses(): RuleStatusMap {
  try {
    const raw = localStorage.getItem(RULE_STATUS_KEY)
    if (raw) return JSON.parse(raw) as RuleStatusMap
  } catch {
    // localStorage unavailable — fall back to defaults
  }
  return {}
}

export function storeRuleStatuses(value: RuleStatusMap): void {
  try {
    localStorage.setItem(RULE_STATUS_KEY, JSON.stringify(value))
  } catch {
    // localStorage unavailable — change won't persist across reloads
  }
}

// --- localStorage persistence for region-multiplier-driven history entries (mock-only, session-local) ---

const REGION_HISTORY_KEY = 'medtech-cms:Point-rules:region-history'

export type RegionHistoryMap = Record<string, RegionPointHistoryEntry[]>

export function getStoredRegionHistory(): RegionHistoryMap {
  try {
    const raw = localStorage.getItem(REGION_HISTORY_KEY)
    if (raw) return JSON.parse(raw) as RegionHistoryMap
  } catch {
    // localStorage unavailable — fall back to none
  }
  return {}
}

export function appendRegionHistoryEntries(
  entries: Record<string, RegionPointHistoryEntry[]>,
): void {
  const current = getStoredRegionHistory()
  const next: RegionHistoryMap = { ...current }
  for (const [ruleId, newEntries] of Object.entries(entries)) {
    next[ruleId] = [...newEntries, ...(current[ruleId] ?? [])]
  }
  try {
    localStorage.setItem(REGION_HISTORY_KEY, JSON.stringify(next))
  } catch {
    // localStorage unavailable — change won't persist across reloads
  }
}
