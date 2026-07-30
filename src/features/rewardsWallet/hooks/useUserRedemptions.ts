import { useEffect, useReducer } from 'react'
import { redemptionsService } from '@/features/rewardsWallet/services/redemptionsService'
import type { RedemptionRequest } from '@/features/rewardsWallet/types/rewardsWallet.types'

interface State {
  redemptions: RedemptionRequest[]
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; redemptions: RedemptionRequest[] }
  | { type: 'failed'; error: string }

const initialState: State = { redemptions: [], isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { redemptions: action.redemptions, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useUserRedemptions(userId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    redemptionsService
      .getRedemptionsByUserId(userId)
      .then((redemptions) => {
        if (!cancelled) dispatch({ type: 'succeeded', redemptions })
      })
      .catch((err: Error) => {
        if (!cancelled)
          dispatch({ type: 'failed', error: err.message ?? 'Failed to load redemption history.' })
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  return state
}
