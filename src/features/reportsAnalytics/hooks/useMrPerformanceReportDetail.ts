import { useEffect, useReducer } from 'react'
import { mrPerformanceReportsService } from '@/features/reportsAnalytics/services/mrPerformanceReportsService'
import type { MrPerformanceDetails } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

interface State {
  details: MrPerformanceDetails | undefined
  isLoading: boolean
  error: string | null
}

type Action = { type: 'loading' } | { type: 'succeeded'; details: MrPerformanceDetails | undefined } | { type: 'failed'; error: string }

const initialState: State = { details: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { details: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { details: action.details, isLoading: false, error: null }
    case 'failed':
      return { details: undefined, isLoading: false, error: action.error }
  }
}

export function useMrPerformanceReportDetail(mrReportId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!mrReportId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    mrPerformanceReportsService
      .getMrPerformanceDetails(mrReportId)
      .then((details) => {
        if (!cancelled) dispatch({ type: 'succeeded', details })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load MR performance details.' })
      })

    return () => {
      cancelled = true
    }
  }, [mrReportId])

  return state
}
