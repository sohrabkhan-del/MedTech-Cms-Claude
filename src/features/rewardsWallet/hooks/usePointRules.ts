import { useEffect, useReducer } from 'react'
import {
  useGetPointRulesQuery,
  useGetProductRuleGroupsQuery,
  useGetPointRuleKpisQuery,
  useGetPointDistributionByCategoryQuery,
  useGetRegionMultipliersQuery,
  useGetRegionMultiplierDatesQuery,
  useGetRuleStatusesQuery,
  useSaveRegionMultipliersMutation,
  useSaveRegionMultiplierDatesMutation,
  useSaveRuleStatusesMutation,
  useSaveRegionHistoryEntriesMutation,
  getChangeDate,
  getChangeTimestamp,
  type RegionMultiplierMap,
  type RegionDateMap,
  type RuleStatusMap,
} from '@/features/rewardsWallet/services/PointRulesApi'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type {
  PointRuleRegion,
  PointRulePartnerType,
  RegionPointHistoryEntry,
} from '@/features/rewardsWallet/types/rewardsWallet.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

interface State {
  baseValueOverrides: Record<string, number>
}

type Action = { type: 'baseValueChanged'; ruleId: string; value: number }

const initialState: State = { baseValueOverrides: {} }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'baseValueChanged':
      return {
        ...state,
        baseValueOverrides: {
          ...state.baseValueOverrides,
          [action.ruleId]: action.value,
        },
      }
  }
}

export function usePointRules() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { user } = useAuth()

  const rulesResult = useGetPointRulesQuery()
  const productGroupsResult = useGetProductRuleGroupsQuery()
  const kpisResult = useGetPointRuleKpisQuery()
  const distributionResult = useGetPointDistributionByCategoryQuery()
  const regionMultipliersResult = useGetRegionMultipliersQuery()
  const multiplierDatesResult = useGetRegionMultiplierDatesQuery()
  const ruleStatusesResult = useGetRuleStatusesQuery()

  const [saveRegionMultipliersMutation] = useSaveRegionMultipliersMutation()
  const [saveRegionMultiplierDatesMutation] = useSaveRegionMultiplierDatesMutation()
  const [saveRuleStatusesMutation] = useSaveRuleStatusesMutation()
  const [saveRegionHistoryEntriesMutation] = useSaveRegionHistoryEntriesMutation()

  useEffect(() => {
    dispatch({ type: 'baseValueChanged', ruleId: '', value: 0 })
    // Reset handled implicitly: baseValueOverrides only ever grows from user edits,
    // matching original per-mount reset behavior is not needed since RTK Query
    // caches results across mounts instead of refetching from scratch each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isLoading =
    rulesResult.isLoading ||
    productGroupsResult.isLoading ||
    kpisResult.isLoading ||
    distributionResult.isLoading ||
    regionMultipliersResult.isLoading ||
    multiplierDatesResult.isLoading ||
    ruleStatusesResult.isLoading

  const firstError =
    rulesResult.error ??
    productGroupsResult.error ??
    kpisResult.error ??
    distributionResult.error ??
    regionMultipliersResult.error ??
    multiplierDatesResult.error ??
    ruleStatusesResult.error

  const error = firstError ? getApiErrorMessage(firstError, 'Failed to load point value rules.') : null

  const rules = rulesResult.data ?? []
  const productGroups = productGroupsResult.data ?? []
  const kpis = kpisResult.data ?? null
  const distributionByCategory = distributionResult.data ?? []
  const regionMultipliers = regionMultipliersResult.data ?? null
  const multiplierDates = multiplierDatesResult.data ?? null
  const statusOverrides = ruleStatusesResult.data ?? {}

  async function setRegionMultiplier(partnerType: PointRulePartnerType, region: PointRuleRegion, value: number) {
    if (!regionMultipliers || !multiplierDates) return
    const changeDate = getChangeDate()
    const nextMultipliers = {
      ...regionMultipliers,
      [partnerType]: {
        ...regionMultipliers[partnerType],
        [region]: value,
      },
    }
    const nextDates = {
      ...multiplierDates,
      [partnerType]: {
        ...multiplierDates[partnerType],
        [region]: changeDate,
      },
    }
    await Promise.all([
      saveRegionMultipliersMutation(nextMultipliers).unwrap(),
      saveRegionMultiplierDatesMutation(nextDates).unwrap(),
    ])
  }

  async function setRegionMultipliers(partnerType: PointRulePartnerType, next: Record<PointRuleRegion, number>) {
    if (!multiplierDates || !regionMultipliers) return
    const changeDate = getChangeDate()
    const changeTimestamp = getChangeTimestamp()
    const currentForPartner = regionMultipliers[partnerType]
    const nextDatesForPartner = { ...multiplierDates[partnerType] }
    const changedRegions = (Object.keys(next) as PointRuleRegion[]).filter(
      (region) => next[region] !== currentForPartner[region],
    )
    for (const region of changedRegions) nextDatesForPartner[region] = changeDate
    const nextDates: RegionDateMap = {
      ...multiplierDates,
      [partnerType]: nextDatesForPartner,
    }

    const historyEntries: Record<string, RegionPointHistoryEntry[]> = {}
    if (changedRegions.length > 0) {
      for (const rule of rules) {
        if (rule.partnerType !== partnerType) continue
        const entries: RegionPointHistoryEntry[] = []
        for (const region of changedRegions) {
          const regionRow = rule.regions.find((r) => r.region === region)
          if (!regionRow) continue
          const previousMultiplier = currentForPartner[region]
          const currentMultiplier = next[region]
          const baseValue = state.baseValueOverrides[rule.id] ?? rule.basePointValue
          entries.push({
            id: `${rule.id}-region-${region}-${Date.now()}`,
            region,
            previousMultiplier,
            currentMultiplier,
            previousRewardPoints: regionRow.currentPoints,
            previousEffectiveDate: regionRow.currentEffectiveDate,
            currentRewardPoints: Math.round((baseValue * currentMultiplier) / 100) * 100,
            currentEffectiveDate: changeDate,
            changedBy: user?.name ?? 'System',
            changedAt: changeTimestamp,
          })
        }
        if (entries.length > 0) historyEntries[rule.id] = entries
      }
    }

    const nextMultipliers: RegionMultiplierMap = { ...regionMultipliers, [partnerType]: next }
    await Promise.all([
      saveRegionMultipliersMutation(nextMultipliers).unwrap(),
      saveRegionMultiplierDatesMutation(nextDates).unwrap(),
      Object.keys(historyEntries).length > 0
        ? saveRegionHistoryEntriesMutation(historyEntries).unwrap()
        : Promise.resolve(),
    ])
  }

  function setBaseValueOverride(ruleId: string, value: number) {
    dispatch({ type: 'baseValueChanged', ruleId, value })
  }

  async function setRuleStatus(ruleId: string, status: 'active' | 'inactive') {
    const next: RuleStatusMap = { ...statusOverrides, [ruleId]: status }
    await saveRuleStatusesMutation(next).unwrap()
  }

  return {
    rules,
    productGroups,
    kpis,
    distributionByCategory,
    regionMultipliers,
    multiplierDates,
    baseValueOverrides: state.baseValueOverrides,
    statusOverrides,
    isLoading,
    error,
    setRegionMultiplier,
    setRegionMultipliers,
    setBaseValueOverride,
    setRuleStatus,
  }
}
