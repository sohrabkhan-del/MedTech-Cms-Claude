import { useEffect, useReducer } from 'react'
import { mrPerformanceReportsService } from '@/features/reportsAnalytics/services/mrPerformanceReportsService'
import type { MrPerformanceReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import type { mrPerformanceKpis } from '@/features/reportsAnalytics/mockMrPerformanceReports'

type MrPerformanceKpis = typeof mrPerformanceKpis

interface State {
  reports: MrPerformanceReportRow[]
  kpis: MrPerformanceKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; reports: MrPerformanceReportRow[]; kpis: MrPerformanceKpis }
  | { type: 'failed'; error: string }

const initialState: State = { reports: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { reports: action.reports, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useMrPerformanceReports() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([mrPerformanceReportsService.getMrPerformanceReports(), mrPerformanceReportsService.getMrPerformanceKpis()])
      .then(([reports, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', reports, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load MR performance reports.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
