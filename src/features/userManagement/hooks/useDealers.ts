import { useEffect, useReducer } from 'react'
import { partnersService } from '@/features/userManagement/services/partnersService'
import type { Dealer } from '@/features/userManagement/types/userManagement.types'
import type { dealerKpis } from '@/features/dealers/mockDealers'

type DealerKpis = typeof dealerKpis

interface State {
  dealers: Dealer[]
  kpis: DealerKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; dealers: Dealer[]; kpis: DealerKpis }
  | { type: 'failed'; error: string }

const initialState: State = { dealers: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { dealers: action.dealers, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useDealers() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([partnersService.getDealers(), partnersService.getDealerKpis()])
      .then(([dealers, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', dealers, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load dealers.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
