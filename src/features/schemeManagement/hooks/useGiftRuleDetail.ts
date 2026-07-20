import { useEffect, useReducer } from 'react'
import { giftRulesService } from '@/features/schemeManagement/services/giftRulesService'
import type { RewardRule } from '@/features/schemeManagement/types/schemeManagement.types'

interface State {
  rule: RewardRule | undefined
  activeOverride: boolean | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; rule: RewardRule | undefined }
  | { type: 'failed'; error: string }
  | { type: 'activeChanged'; active: boolean }

const initialState: State = { rule: undefined, activeOverride: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { rule: undefined, activeOverride: null, isLoading: true, error: null }
    case 'succeeded':
      return { rule: action.rule, activeOverride: null, isLoading: false, error: null }
    case 'failed':
      return { rule: undefined, activeOverride: null, isLoading: false, error: action.error }
    case 'activeChanged':
      return { ...state, activeOverride: action.active }
  }
}

export function useGiftRuleDetail(ruleId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!ruleId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    giftRulesService
      .getRewardRuleDetail(ruleId)
      .then((rule) => {
        if (!cancelled) dispatch({ type: 'succeeded', rule })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load reward rule.' })
      })

    return () => {
      cancelled = true
    }
  }, [ruleId])

  async function setActive(active: boolean) {
    if (!ruleId) return
    await giftRulesService.setRewardRuleActive(ruleId, active)
    dispatch({ type: 'activeChanged', active })
  }

  async function remove() {
    if (!ruleId) return
    await giftRulesService.deleteRewardRule(ruleId)
  }

  const rule = state.rule && state.activeOverride !== null ? { ...state.rule, active: state.activeOverride } : state.rule

  return { ...state, rule, setActive, remove }
}
