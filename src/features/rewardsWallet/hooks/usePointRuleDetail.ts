import { useEffect, useReducer } from 'react'
import { PointRulesService } from '@/features/rewardsWallet/services/PointRulesService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type {
  PointRuleRegion,
  PointValueRule,
  RegionPointHistoryEntry,
} from '@/features/rewardsWallet/types/rewardsWallet.types'

interface State {
  rule: PointValueRule | undefined
  siblingRule: PointValueRule | undefined
  basePointValueOverrides: Record<string, number>
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | {
      type: 'succeeded'
      rule: PointValueRule | undefined
      siblingRule: PointValueRule | undefined
    }
  | { type: 'failed'; error: string }
  | { type: 'basePointValueChanged'; ruleId: string; value: number }
  | {
      type: 'regionMultiplierUpdated'
      rule: PointValueRule
      isSibling: boolean
    }

const initialState: State = {
  rule: undefined,
  siblingRule: undefined,
  basePointValueOverrides: {},
  isLoading: false,
  error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return {
        rule: undefined,
        siblingRule: undefined,
        basePointValueOverrides: {},
        isLoading: true,
        error: null,
      }
    case 'succeeded':
      return {
        rule: action.rule,
        siblingRule: action.siblingRule,
        basePointValueOverrides: {},
        isLoading: false,
        error: null,
      }
    case 'failed':
      return {
        rule: undefined,
        siblingRule: undefined,
        basePointValueOverrides: {},
        isLoading: false,
        error: action.error,
      }
    case 'basePointValueChanged':
      return {
        ...state,
        basePointValueOverrides: {
          ...state.basePointValueOverrides,
          [action.ruleId]: action.value,
        },
      }
    case 'regionMultiplierUpdated':
      return action.isSibling
        ? { ...state, siblingRule: action.rule }
        : { ...state, rule: action.rule }
  }
}

export function usePointRuleDetail(ruleId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { user } = useAuth()

  useEffect(() => {
    if (!ruleId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    PointRulesService.getPointRuleDetail(ruleId)
      .then(async (rule) => {
        if (!rule) return { rule, siblingRule: undefined }
        const siblingPartnerType =
          rule.partnerType === 'Dealer' ? 'Chemist' : 'Dealer'
        const siblingRule = await PointRulesService.getSiblingPointRule(
          rule.modelCode,
          siblingPartnerType,
        )
        return { rule, siblingRule }
      })
      .then(({ rule, siblingRule }) => {
        if (!cancelled) dispatch({ type: 'succeeded', rule, siblingRule })
      })
      .catch((err: Error) => {
        if (!cancelled)
          dispatch({
            type: 'failed',
            error: err.message ?? 'Failed to load point value rule.',
          })
      })

    return () => {
      cancelled = true
    }
  }, [ruleId])

  async function setBasePointValue(value: number, targetRuleId?: string) {
    const id = targetRuleId ?? ruleId
    if (!id) return
    await PointRulesService.setBasePointValue(id, value)
    dispatch({ type: 'basePointValueChanged', ruleId: id, value })
  }

  async function updateRegionMultiplier(
    region: PointRuleRegion,
    newMultiplier: number,
    targetRuleId?: string,
  ) {
    const id = targetRuleId ?? ruleId
    if (!id) return
    const targetRule =
      state.rule?.id === id
        ? state.rule
        : state.siblingRule?.id === id
          ? state.siblingRule
          : undefined
    if (!targetRule) return
    const regionRow = targetRule.regions.find((r) => r.region === region)
    if (!regionRow) return

    const changeDate = PointRulesService.getChangeDate()
    const changeTimestamp = PointRulesService.getChangeTimestamp()
    const baseValue =
      state.basePointValueOverrides[id] ?? targetRule.basePointValue
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

    await PointRulesService.saveRegionHistoryEntries({ [id]: [historyEntry] })

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
    dispatch({
      type: 'regionMultiplierUpdated',
      rule: updatedRule,
      isSibling: state.siblingRule?.id === id,
    })
  }

  const rule =
    state.rule && state.rule.id in state.basePointValueOverrides
      ? {
          ...state.rule,
          basePointValue: state.basePointValueOverrides[state.rule.id]!,
        }
      : state.rule
  const siblingRule =
    state.siblingRule && state.siblingRule.id in state.basePointValueOverrides
      ? {
          ...state.siblingRule,
          basePointValue: state.basePointValueOverrides[state.siblingRule.id]!,
        }
      : state.siblingRule
  const highestCurrentPoints = rule
    ? PointRulesService.getHighestCurrentPoints(rule)
    : 0

  return {
    ...state,
    rule,
    siblingRule,
    highestCurrentPoints,
    setBasePointValue,
    updateRegionMultiplier,
  }
}
