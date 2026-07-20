import { useEffect, useReducer } from 'react'
import { giftRulesService } from '@/features/schemeManagement/services/giftRulesService'
import type { RewardRule } from '@/features/schemeManagement/types/schemeManagement.types'
import type { giftRulesDashboard } from '@/features/schemes/mockGiftRules'

type GiftRulesDashboard = typeof giftRulesDashboard & { currentActiveScheme: string }

interface State {
  permanentCatalogRewards: RewardRule[]
  schemeTrackRewards: RewardRule[]
  dashboard: GiftRulesDashboard | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; permanentCatalogRewards: RewardRule[]; schemeTrackRewards: RewardRule[]; dashboard: GiftRulesDashboard }
  | { type: 'failed'; error: string }

const initialState: State = { permanentCatalogRewards: [], schemeTrackRewards: [], dashboard: null, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { permanentCatalogRewards: [], schemeTrackRewards: [], dashboard: null, isLoading: true, error: null }
    case 'succeeded':
      return { ...action, isLoading: false, error: null }
    case 'failed':
      return { permanentCatalogRewards: [], schemeTrackRewards: [], dashboard: null, isLoading: false, error: action.error }
  }
}

export function useGiftRules() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      giftRulesService.getPermanentCatalogRewards(),
      giftRulesService.getSchemeTrackRewards(),
      giftRulesService.getGiftRulesDashboard(),
    ])
      .then(([permanentCatalogRewards, schemeTrackRewards, dashboard]) => {
        if (!cancelled) dispatch({ type: 'succeeded', permanentCatalogRewards, schemeTrackRewards, dashboard })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load gift rules.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
