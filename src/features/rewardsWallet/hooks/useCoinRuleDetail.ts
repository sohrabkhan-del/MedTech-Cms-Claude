import { useEffect, useReducer } from 'react'
import { coinRulesService } from '@/features/rewardsWallet/services/coinRulesService'
import type { CoinValueRule } from '@/features/rewardsWallet/types/rewardsWallet.types'

interface State {
  rule: CoinValueRule | undefined
  baseCoinValueOverride: number | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; rule: CoinValueRule | undefined }
  | { type: 'failed'; error: string }
  | { type: 'baseCoinValueChanged'; value: number }

const initialState: State = { rule: undefined, baseCoinValueOverride: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { rule: undefined, baseCoinValueOverride: null, isLoading: true, error: null }
    case 'succeeded':
      return { rule: action.rule, baseCoinValueOverride: null, isLoading: false, error: null }
    case 'failed':
      return { rule: undefined, baseCoinValueOverride: null, isLoading: false, error: action.error }
    case 'baseCoinValueChanged':
      return { ...state, baseCoinValueOverride: action.value }
  }
}

export function useCoinRuleDetail(ruleId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!ruleId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    coinRulesService
      .getCoinRuleDetail(ruleId)
      .then((rule) => {
        if (!cancelled) dispatch({ type: 'succeeded', rule })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load coin value rule.' })
      })

    return () => {
      cancelled = true
    }
  }, [ruleId])

  async function setBaseCoinValue(value: number) {
    if (!ruleId) return
    await coinRulesService.setBaseCoinValue(ruleId, value)
    dispatch({ type: 'baseCoinValueChanged', value })
  }

  const rule = state.rule && state.baseCoinValueOverride !== null ? { ...state.rule, baseCoinValue: state.baseCoinValueOverride } : state.rule
  const highestCurrentPoints = rule ? coinRulesService.getHighestCurrentPoints(rule) : 0

  return { ...state, rule, highestCurrentPoints, setBaseCoinValue }
}
