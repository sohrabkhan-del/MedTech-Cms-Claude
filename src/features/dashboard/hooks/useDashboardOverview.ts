import { useEffect, useReducer } from 'react'
import { dashboardService } from '@/features/dashboard/services/dashboardService'
import type { DashboardOverview } from '@/features/dashboard/types/dashboard.types'

interface State {
  overview: DashboardOverview | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; overview: DashboardOverview }
  | { type: 'failed'; error: string }

const initialState: State = { overview: null, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { overview: null, isLoading: true, error: null }
    case 'succeeded':
      return { overview: action.overview, isLoading: false, error: null }
    case 'failed':
      return { overview: null, isLoading: false, error: action.error }
  }
}

export function useDashboardOverview() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    dashboardService
      .getOverview()
      .then((overview) => {
        if (!cancelled) dispatch({ type: 'succeeded', overview })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load dashboard overview.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
