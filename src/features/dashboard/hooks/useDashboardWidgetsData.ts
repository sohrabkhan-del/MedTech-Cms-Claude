import { useEffect, useReducer } from 'react'
import { dashboardService } from '@/features/dashboard/services/dashboardService'
import type { DashboardWidgetsData } from '@/features/dashboard/types/dashboard.types'

interface State {
  data: DashboardWidgetsData | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; data: DashboardWidgetsData }
  | { type: 'failed'; error: string }

const initialState: State = { data: null, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { data: null, isLoading: true, error: null }
    case 'succeeded':
      return { data: action.data, isLoading: false, error: null }
    case 'failed':
      return { data: null, isLoading: false, error: action.error }
  }
}

/** Backs all dashboard widgets (activity timeline, recent scans, leaderboard, etc). */
export function useDashboardWidgetsData() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    dashboardService
      .getWidgetsData()
      .then((data) => {
        if (!cancelled) dispatch({ type: 'succeeded', data })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load dashboard widgets.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
