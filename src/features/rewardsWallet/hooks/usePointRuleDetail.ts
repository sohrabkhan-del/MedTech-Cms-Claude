import { useEffect, useReducer } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetPointRuleDetailQuery,
  useLazyGetSiblingPointRuleQuery,
  getHighestCurrentPoints,
  getChangeDate,
  getChangeTimestamp,
  useSaveRegionHistoryEntriesMutation,
  useSetBasePointValueMutation,
} from '@/features/rewardsWallet/services/PointRulesApi'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type {
  PointRuleRegion,
  PointValueRule,
  RegionPointHistoryEntry,
} from '@/features/rewardsWallet/types/rewardsWallet.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

interface State {
  basePointValueOverrides: Record<string, number>
  regionOverrides: Record<string, PointValueRule>
}

type Action =
  | { type: 'reset' }
  | { type: 'basePointValueChanged'; ruleId: string; value: number }
  | { type: 'regionMultiplierUpdated'; rule: PointValueRule }

const initialState: State = {
  basePointValueOverrides: {},
  regionOverrides: {},
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      return initialState
    case 'basePointValueChanged':
      return {
        ...state,
        basePointValueOverrides: {
          ...state.basePointValueOverrides,
          [action.ruleId]: action.value,
        },
      }
    case 'regionMultiplierUpdated':
      return {
        ...state,
        regionOverrides: {
          ...state.regionOverrides,
          [action.rule.id]: action.rule,
        },
      }
  }
}

export function usePointRuleDetail(ruleId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { user } = useAuth()

  const {
    data: fetchedRule,
    isLoading: isRuleLoading,
    error: ruleQueryError,
  } = useGetPointRuleDetailQuery(ruleId ?? skipToken)

  const [fetchSibling, { data: fetchedSiblingRule, isFetching: isSiblingFetching }] =
    useLazyGetSiblingPointRuleQuery()

  const [saveRegionHistoryEntriesMutation] = useSaveRegionHistoryEntriesMutation()
  const [setBasePointValueMutation] = useSetBasePointValueMutation()

  useEffect(() => {
    dispatch({ type: 'reset' })
  }, [ruleId])

  useEffect(() => {
    if (!fetchedRule) return
    const siblingPartnerType = fetchedRule.partnerType === 'Dealer' ? 'Chemist' : 'Dealer'
    fetchSibling({ modelCode: fetchedRule.modelCode, partnerType: siblingPartnerType })
  }, [fetchedRule, fetchSibling])

  const isLoading = isRuleLoading || (!!fetchedRule && isSiblingFetching)
  const error = ruleQueryError ? getApiErrorMessage(ruleQueryError, 'Failed to load point value rule.') : null

  function applyOverrides(rule: PointValueRule | undefined): PointValueRule | undefined {
    if (!rule) return rule
    let next = state.regionOverrides[rule.id] ?? rule
    if (next.id in state.basePointValueOverrides) {
      next = { ...next, basePointValue: state.basePointValueOverrides[next.id]! }
    }
    return next
  }

  const rule = applyOverrides(fetchedRule)
  const siblingRule = applyOverrides(fetchedSiblingRule)

  async function setBasePointValue(value: number, targetRuleId?: string) {
    const id = targetRuleId ?? ruleId
    if (!id) return
    await setBasePointValueMutation({ id, basePointValue: value }).unwrap()
    dispatch({ type: 'basePointValueChanged', ruleId: id, value })
  }

  async function updateRegionMultiplier(
    region: PointRuleRegion,
    newMultiplier: number,
    targetRuleId?: string,
  ) {
    const id = targetRuleId ?? ruleId
    if (!id) return
    const targetRule = rule?.id === id ? rule : siblingRule?.id === id ? siblingRule : undefined
    if (!targetRule) return
    const regionRow = targetRule.regions.find((r) => r.region === region)
    if (!regionRow) return

    const changeDate = getChangeDate()
    const changeTimestamp = getChangeTimestamp()
    const baseValue = state.basePointValueOverrides[id] ?? targetRule.basePointValue
    const newPoints = Math.round((baseValue * newMultiplier) / 100) * 100

    const historyEntry: RegionPointHistoryEntry = {
      id: `${id}-region-${region}-${Date.now()}`,
      region,
      previousMultiplier: regionRow.currentMultiplier,
      currentMultiplier: newMultiplier,
      previousRewardPoints: regionRow.currentPoints,
      previousEffectiveDate: regionRow.currentEffectiveDate,
      currentRewardPoints: newPoints,
      currentEffectiveDate: changeDate,
      changedBy: user?.name ?? 'System',
      changedAt: changeTimestamp,
    }

    await saveRegionHistoryEntriesMutation({ [id]: [historyEntry] }).unwrap()

    const updatedRule: PointValueRule = {
      ...targetRule,
      regions: targetRule.regions.map((r) =>
        r.region === region
          ? {
              ...r,
              previousMultiplier: r.currentMultiplier,
              currentMultiplier: newMultiplier,
              previousPoints: r.currentPoints,
              previousEffectiveDate: r.currentEffectiveDate,
              currentPoints: newPoints,
              currentEffectiveDate: changeDate,
            }
          : r,
      ),
      regionalHistory: [historyEntry, ...targetRule.regionalHistory],
    }
    dispatch({ type: 'regionMultiplierUpdated', rule: updatedRule })
  }

  const highestCurrentPoints = rule ? getHighestCurrentPoints(rule) : 0

  return {
    rule,
    siblingRule,
    basePointValueOverrides: state.basePointValueOverrides,
    isLoading,
    error,
    highestCurrentPoints,
    setBasePointValue,
    updateRegionMultiplier,
  }
}
