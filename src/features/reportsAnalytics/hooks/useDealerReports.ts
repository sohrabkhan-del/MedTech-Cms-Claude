import { useEffect, useReducer } from 'react'
import { dealerReportsService } from '@/features/reportsAnalytics/services/dealerReportsService'
import type { DealerReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import type { dealerReportKpis } from '@/features/reportsAnalytics/mockDealerReports'

type DealerReportKpis = typeof dealerReportKpis

interface State {
  reports: DealerReportRow[]
  kpis: DealerReportKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; reports: DealerReportRow[]; kpis: DealerReportKpis }
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

export function useDealerReports() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([dealerReportsService.getDealerReports(), dealerReportsService.getDealerReportKpis()])
      .then(([reports, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', reports, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load dealer reports.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
