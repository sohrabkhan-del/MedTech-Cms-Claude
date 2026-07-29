import { useEffect, useReducer } from 'react'
import {
  PointRulesService,
  type RegionMultiplierMap,
  type RegionDateMap,
  type RuleStatusMap,
} from '@/features/rewardsWallet/services/PointRulesService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type {
  PointValueRule,
  PointRuleRegion,
  PointRulePartnerType,
  RegionPointHistoryEntry,
} from '@/features/rewardsWallet/types/rewardsWallet.types'
import {
  PointRuleKpis as PointRuleKpisValue,
  PointDistributionByCategory as PointDistributionByCategoryValue,
} from '@/features/rewardsWallet/mockPointRules'
import type { ProductPointRuleGroup } from '@/features/rewardsWallet/mockPointRules'

type PointRuleKpis = typeof PointRuleKpisValue
type PointDistributionByCategory = typeof PointDistributionByCategoryValue

interface State {
  rules: PointValueRule[]
  productGroups: ProductPointRuleGroup[]
  kpis: PointRuleKpis | null
  distributionByCategory: PointDistributionByCategory
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
      rules: PointValueRule[]
      productGroups: ProductPointRuleGroup[]
      kpis: PointRuleKpis
      distributionByCategory: PointDistributionByCategory
      regionMultipliers: RegionMultiplierMap
      multiplierDates: RegionDateMap
      statusOverrides: RuleStatusMap
    }
  | { type: 'failed'; error: string }
  | {
      type: 'regionMultiplierChanged'
      regionMultipliers: RegionMultiplierMap
      multiplierDates: RegionDateMap
    }
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
      return {
        ...state,
        regionMultipliers: action.regionMultipliers,
        multiplierDates: action.multiplierDates,
      }
    case 'baseValueChanged':
      return {
        ...state,
        baseValueOverrides: {
          ...state.baseValueOverrides,
          [action.ruleId]: action.value,
        },
      }
    case 'statusChanged':
      return { ...state, statusOverrides: action.statusOverrides }
  }
}

export function usePointRules() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { user } = useAuth()

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      PointRulesService.getPointRules(),
      PointRulesService.getProductRuleGroups(),
      PointRulesService.getPointRuleKpis(),
      PointRulesService.getPointDistributionByCategory(),
      PointRulesService.getRegionMultipliers(),
      PointRulesService.getRegionMultiplierDates(),
      PointRulesService.getRuleStatuses(),
    ])
      .then(
        ([
          rules,
          productGroups,
          kpis,
          distributionByCategory,
          regionMultipliers,
          multiplierDates,
          statusOverrides,
        ]) => {
          if (!cancelled)
            dispatch({
              type: 'succeeded',
              rules,
              productGroups,
              kpis,
              distributionByCategory,
              regionMultipliers,
              multiplierDates,
              statusOverrides,
            })
        },
      )
      .catch((err: Error) => {
        if (!cancelled)
          dispatch({
            type: 'failed',
            error: err.message ?? 'Failed to load point value rules.',
          })
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function setRegionMultiplier(
    partnerType: PointRulePartnerType,
    region: PointRuleRegion,
    value: number,
  ) {
    if (!state.regionMultipliers || !state.multiplierDates) return
    const changeDate = PointRulesService.getChangeDate()
    const nextMultipliers = {
      ...state.regionMultipliers,
      [partnerType]: {
        ...state.regionMultipliers[partnerType],
        [region]: value,
      },
    }
    const nextDates = {
      ...state.multiplierDates,
      [partnerType]: {
        ...state.multiplierDates[partnerType],
        [region]: changeDate,
      },
    }
    await Promise.all([
      PointRulesService.saveRegionMultipliers(nextMultipliers),
      PointRulesService.saveRegionMultiplierDates(nextDates),
    ])
    dispatch({
      type: 'regionMultiplierChanged',
      regionMultipliers: nextMultipliers,
      multiplierDates: nextDates,
    })
  }

  async function setRegionMultipliers(
    partnerType: PointRulePartnerType,
    next: Record<PointRuleRegion, number>,
  ) {
    if (!state.multiplierDates || !state.regionMultipliers) return
    const changeDate = PointRulesService.getChangeDate()
    const changeTimestamp = PointRulesService.getChangeTimestamp()
    const currentForPartner = state.regionMultipliers[partnerType]
    const nextDatesForPartner = { ...state.multiplierDates[partnerType] }
    const changedRegions = (Object.keys(next) as PointRuleRegion[]).filter(
      (region) => next[region] !== currentForPartner[region],
    )
    for (const region of changedRegions)
      nextDatesForPartner[region] = changeDate
    const nextDates = {
      ...state.multiplierDates,
      [partnerType]: nextDatesForPartner,
    }

    const historyEntries: Record<string, RegionPointHistoryEntry[]> = {}
    if (changedRegions.length > 0) {
      for (const rule of state.rules) {
        if (rule.partnerType !== partnerType) continue
        const entries: RegionPointHistoryEntry[] = []
        for (const region of changedRegions) {
          const regionRow = rule.regions.find((r) => r.region === region)
          if (!regionRow) continue
          const previousMultiplier = currentForPartner[region]
          const currentMultiplier = next[region]
          const baseValue =
            state.baseValueOverrides[rule.id] ?? rule.basePointValue
          entries.push({
            id: `${rule.id}-region-${region}-${Date.now()}`,
            region,
            previousMultiplier,
            currentMultiplier,
            previousRewardPoints: regionRow.currentPoints,
            previousEffectiveDate: regionRow.currentEffectiveDate,
            currentRewardPoints:
              Math.round((baseValue * currentMultiplier) / 100) * 100,
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
      PointRulesService.saveRegionMultipliers(nextMultipliers),
      PointRulesService.saveRegionMultiplierDates(nextDates),
      Object.keys(historyEntries).length > 0
        ? PointRulesService.saveRegionHistoryEntries(historyEntries)
        : Promise.resolve(),
    ])
    dispatch({
      type: 'regionMultiplierChanged',
      regionMultipliers: nextMultipliers,
      multiplierDates: nextDates,
    })
  }

  function setBaseValueOverride(ruleId: string, value: number) {
    dispatch({ type: 'baseValueChanged', ruleId, value })
  }

  async function setRuleStatus(ruleId: string, status: 'active' | 'inactive') {
    const next = { ...state.statusOverrides, [ruleId]: status }
    await PointRulesService.saveRuleStatuses(next)
    dispatch({ type: 'statusChanged', statusOverrides: next })
  }

  return {
    ...state,
    setRegionMultiplier,
    setRegionMultipliers,
    setBaseValueOverride,
    setRuleStatus,
  }
}
