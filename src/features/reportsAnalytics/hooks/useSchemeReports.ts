import { useEffect, useReducer } from 'react'
import { schemeReportsService } from '@/features/reportsAnalytics/services/schemeReportsService'
import type { SchemeReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import type { schemeReportKpis } from '@/features/reports/mockSchemeReports'

type SchemeReportKpis = typeof schemeReportKpis

interface FilterOptions {
  typeOptions: string[]
  applicableUserOptions: string[]
}

interface State {
  reports: SchemeReportEntry[]
  kpis: SchemeReportKpis | null
  filterOptions: FilterOptions | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; reports: SchemeReportEntry[]; kpis: SchemeReportKpis; filterOptions: FilterOptions }
  | { type: 'failed'; error: string }

const initialState: State = { reports: [], kpis: null, filterOptions: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { reports: action.reports, kpis: action.kpis, filterOptions: action.filterOptions, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useSchemeReports() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      schemeReportsService.getSchemeReports(),
      schemeReportsService.getSchemeReportKpis(),
      schemeReportsService.getSchemeReportFilterOptions(),
    ])
      .then(([reports, kpis, filterOptions]) => {
        if (!cancelled) dispatch({ type: 'succeeded', reports, kpis, filterOptions })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load scheme reports.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
