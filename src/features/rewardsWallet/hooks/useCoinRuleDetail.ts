import { useEffect, useReducer } from 'react'
import { coinRulesService } from '@/features/rewardsWallet/services/coinRulesService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type {
  CoinRuleRegion,
  CoinValueRule,
  RegionCoinHistoryEntry,
} from '@/features/rewardsWallet/types/rewardsWallet.types'

interface State {
  rule: CoinValueRule | undefined
  siblingRule: CoinValueRule | undefined
  baseCoinValueOverrides: Record<string, number>
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; rule: CoinValueRule | undefined; siblingRule: CoinValueRule | undefined }
  | { type: 'failed'; error: string }
  | { type: 'baseCoinValueChanged'; ruleId: string; value: number }
  | { type: 'regionMultiplierUpdated'; rule: CoinValueRule; isSibling: boolean }

const initialState: State = {
  rule: undefined,
  siblingRule: undefined,
  baseCoinValueOverrides: {},
  isLoading: false,
  error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { rule: undefined, siblingRule: undefined, baseCoinValueOverrides: {}, isLoading: true, error: null }
    case 'succeeded':
      return {
        rule: action.rule,
        siblingRule: action.siblingRule,
        baseCoinValueOverrides: {},
        isLoading: false,
        error: null,
      }
    case 'failed':
      return { rule: undefined, siblingRule: undefined, baseCoinValueOverrides: {}, isLoading: false, error: action.error }
    case 'baseCoinValueChanged':
      return {
        ...state,
        baseCoinValueOverrides: { ...state.baseCoinValueOverrides, [action.ruleId]: action.value },
      }
    case 'regionMultiplierUpdated':
      return action.isSibling
        ? { ...state, siblingRule: action.rule }
        : { ...state, rule: action.rule }
  }
}

export function useCoinRuleDetail(ruleId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { user } = useAuth()

  useEffect(() => {
    if (!ruleId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    coinRulesService
      .getCoinRuleDetail(ruleId)
      .then(async (rule) => {
        if (!rule) return { rule, siblingRule: undefined }
        const siblingPartnerType = rule.partnerType === 'Dealer' ? 'Chemist' : 'Dealer'
        const siblingRule = await coinRulesService.getSiblingCoinRule(rule.modelCode, siblingPartnerType)
        return { rule, siblingRule }
      })
      .then(({ rule, siblingRule }) => {
        if (!cancelled) dispatch({ type: 'succeeded', rule, siblingRule })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load coin value rule.' })
      })

    return () => {
      cancelled = true
    }
  }, [ruleId])

  async function setBaseCoinValue(value: number, targetRuleId?: string) {
    const id = targetRuleId ?? ruleId
    if (!id) return
    await coinRulesService.setBaseCoinValue(id, value)
    dispatch({ type: 'baseCoinValueChanged', ruleId: id, value })
  }

  async function updateRegionMultiplier(region: CoinRuleRegion, newMultiplier: number, targetRuleId?: string) {
    const id = targetRuleId ?? ruleId
    if (!id) return
    const targetRule = state.rule?.id === id ? state.rule : state.siblingRule?.id === id ? state.siblingRule : undefined
    if (!targetRule) return
    const regionRow = targetRule.regions.find((r) => r.region === region)
    if (!regionRow) return

    const changeDate = coinRulesService.getChangeDate()
    const changeTimestamp = coinRulesService.getChangeTimestamp()
    const baseValue = state.baseCoinValueOverrides[id] ?? targetRule.baseCoinValue
    const newPoints = Math.round((baseValue * newMultiplier) / 100) * 100

    const historyEntry: RegionCoinHistoryEntry = {
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

    await coinRulesService.saveRegionHistoryEntries({ [id]: [historyEntry] })

    const updatedRule: CoinValueRule = {
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
    dispatch({ type: 'regionMultiplierUpdated', rule: updatedRule, isSibling: state.siblingRule?.id === id })
  }

  const rule =
    state.rule && state.rule.id in state.baseCoinValueOverrides
      ? { ...state.rule, baseCoinValue: state.baseCoinValueOverrides[state.rule.id]! }
      : state.rule
  const siblingRule =
    state.siblingRule && state.siblingRule.id in state.baseCoinValueOverrides
      ? { ...state.siblingRule, baseCoinValue: state.baseCoinValueOverrides[state.siblingRule.id]! }
      : state.siblingRule
  const highestCurrentPoints = rule ? coinRulesService.getHighestCurrentPoints(rule) : 0

  return { ...state, rule, siblingRule, highestCurrentPoints, setBaseCoinValue, updateRegionMultiplier }
}
