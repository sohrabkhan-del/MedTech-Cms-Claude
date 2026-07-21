import { useEffect, useReducer } from 'react'
import { redemptionsService } from '@/features/rewardsWallet/services/redemptionsService'
import type { RedemptionRequest } from '@/features/rewardsWallet/types/rewardsWallet.types'
import type { redemptionKpis } from '@/features/rewardsWallet/mockRedemptions'

type RedemptionKpis = typeof redemptionKpis

interface State {
  redemptions: RedemptionRequest[]
  kpis: RedemptionKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; redemptions: RedemptionRequest[]; kpis: RedemptionKpis }
  | { type: 'failed'; error: string }

const initialState: State = { redemptions: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { redemptions: action.redemptions, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useRedemptions() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([redemptionsService.getRedemptions(), redemptionsService.getRedemptionKpis()])
      .then(([redemptions, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', redemptions, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load redemption requests.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
