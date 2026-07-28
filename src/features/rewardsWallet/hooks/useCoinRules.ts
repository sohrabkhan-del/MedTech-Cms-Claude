import { useEffect, useReducer } from 'react'
import { coinRulesService, type RegionMultiplierMap, type RegionDateMap, type RuleStatusMap } from '@/features/rewardsWallet/services/coinRulesService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { CoinValueRule, CoinRuleRegion, CoinRulePartnerType, RegionCoinHistoryEntry } from '@/features/rewardsWallet/types/rewardsWallet.types'
import type { coinRuleKpis, coinDistributionByCategory, ProductCoinRuleGroup } from '@/features/rewardsWallet/mockCoinRules'

type CoinRuleKpis = typeof coinRuleKpis
type CoinDistributionByCategory = typeof coinDistributionByCategory

interface State {
  rules: CoinValueRule[]
  productGroups: ProductCoinRuleGroup[]
  kpis: CoinRuleKpis | null
  distributionByCategory: CoinDistributionByCategory
  regionMultipliers: RegionMultiplierMap | null
  multiplierDates: RegionDateMap | null
  baseValueOverrides: Record<string, number>
  statusOverrides: RuleStatusMap
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | {
      type: 'succeeded'
      rules: CoinValueRule[]
      productGroups: ProductCoinRuleGroup[]
      kpis: CoinRuleKpis
      distributionByCategory: CoinDistributionByCategory
      regionMultipliers: RegionMultiplierMap
      multiplierDates: RegionDateMap
      statusOverrides: RuleStatusMap
    }
  | { type: 'failed'; error: string }
  | { type: 'regionMultiplierChanged'; regionMultipliers: RegionMultiplierMap; multiplierDates: RegionDateMap }
  | { type: 'baseValueChanged'; ruleId: string; value: number }
  | { type: 'statusChanged'; statusOverrides: RuleStatusMap }

const initialState: State = {
  rules: [],
  productGroups: [],
  kpis: null,
  distributionByCategory: [],
  regionMultipliers: null,
  multiplierDates: null,
  baseValueOverrides: {},
  statusOverrides: {},
  isLoading: false,
  error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return {
        rules: action.rules,
        productGroups: action.productGroups,
        kpis: action.kpis,
        distributionByCategory: action.distributionByCategory,
        regionMultipliers: action.regionMultipliers,
        multiplierDates: action.multiplierDates,
        baseValueOverrides: {},
        statusOverrides: action.statusOverrides,
        isLoading: false,
        error: null,
      }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
    case 'regionMultiplierChanged':
      return { ...state, regionMultipliers: action.regionMultipliers, multiplierDates: action.multiplierDates }
    case 'baseValueChanged':
      return { ...state, baseValueOverrides: { ...state.baseValueOverrides, [action.ruleId]: action.value } }
    case 'statusChanged':
      return { ...state, statusOverrides: action.statusOverrides }
  }
}

export function useCoinRules() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { user } = useAuth()

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      coinRulesService.getCoinRules(),
      coinRulesService.getProductRuleGroups(),
      coinRulesService.getCoinRuleKpis(),
      coinRulesService.getCoinDistributionByCategory(),
      coinRulesService.getRegionMultipliers(),
      coinRulesService.getRegionMultiplierDates(),
      coinRulesService.getRuleStatuses(),
    ])
      .then(([rules, productGroups, kpis, distributionByCategory, regionMultipliers, multiplierDates, statusOverrides]) => {
        if (!cancelled) dispatch({ type: 'succeeded', rules, productGroups, kpis, distributionByCategory, regionMultipliers, multiplierDates, statusOverrides })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load coin value rules.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function setRegionMultiplier(partnerType: CoinRulePartnerType, region: CoinRuleRegion, value: number) {
    if (!state.regionMultipliers || !state.multiplierDates) return
    const changeDate = coinRulesService.getChangeDate()
    const nextMultipliers = {
      ...state.regionMultipliers,
      [partnerType]: { ...state.regionMultipliers[partnerType], [region]: value },
    }
    const nextDates = {
      ...state.multiplierDates,
      [partnerType]: { ...state.multiplierDates[partnerType], [region]: changeDate },
    }
    await Promise.all([coinRulesService.saveRegionMultipliers(nextMultipliers), coinRulesService.saveRegionMultiplierDates(nextDates)])
    dispatch({ type: 'regionMultiplierChanged', regionMultipliers: nextMultipliers, multiplierDates: nextDates })
  }

  async function setRegionMultipliers(partnerType: CoinRulePartnerType, next: Record<CoinRuleRegion, number>) {
    if (!state.multiplierDates || !state.regionMultipliers) return
    const changeDate = coinRulesService.getChangeDate()
    const changeTimestamp = coinRulesService.getChangeTimestamp()
    const currentForPartner = state.regionMultipliers[partnerType]
    const nextDatesForPartner = { ...state.multiplierDates[partnerType] }
    const changedRegions = (Object.keys(next) as CoinRuleRegion[]).filter(
      (region) => next[region] !== currentForPartner[region],
    )
    for (const region of changedRegions) nextDatesForPartner[region] = changeDate
    const nextDates = { ...state.multiplierDates, [partnerType]: nextDatesForPartner }

    const historyEntries: Record<string, RegionCoinHistoryEntry[]> = {}
    if (changedRegions.length > 0) {
      for (const rule of state.rules) {
        if (rule.partnerType !== partnerType) continue
        const entries: RegionCoinHistoryEntry[] = []
        for (const region of changedRegions) {
          const regionRow = rule.regions.find((r) => r.region === region)
          if (!regionRow) continue
          const previousMultiplier = currentForPartner[region]
          const currentMultiplier = next[region]
          const baseValue = state.baseValueOverrides[rule.id] ?? rule.baseCoinValue
          entries.push({
            id: `${rule.id}-region-${region}-${Date.now()}`,
            region,
            previousMultiplier,
            currentMultiplier,
            previousRewardPoints: regionRow.currentPoints,
            previousEffectiveDate: regionRow.currentEffectiveDate,
            currentRewardPoints: Math.round(baseValue * currentMultiplier / 100) * 100,
            currentEffectiveDate: changeDate,
            changedBy: user?.name ?? 'System',
            changedAt: changeTimestamp,
          })
        }
        if (entries.length > 0) historyEntries[rule.id] = entries
      }
    }

    const nextMultipliers = { ...state.regionMultipliers, [partnerType]: next }
    await Promise.all([
      coinRulesService.saveRegionMultipliers(nextMultipliers),
      coinRulesService.saveRegionMultiplierDates(nextDates),
      Object.keys(historyEntries).length > 0
        ? coinRulesService.saveRegionHistoryEntries(historyEntries)
        : Promise.resolve(),
    ])
    dispatch({ type: 'regionMultiplierChanged', regionMultipliers: nextMultipliers, multiplierDates: nextDates })
  }

  function setBaseValueOverride(ruleId: string, value: number) {
    dispatch({ type: 'baseValueChanged', ruleId, value })
  }

  async function setRuleStatus(ruleId: string, status: 'active' | 'inactive') {
    const next = { ...state.statusOverrides, [ruleId]: status }
    await coinRulesService.saveRuleStatuses(next)
    dispatch({ type: 'statusChanged', statusOverrides: next })
  }

  return { ...state, setRegionMultiplier, setRegionMultipliers, setBaseValueOverride, setRuleStatus }
}
