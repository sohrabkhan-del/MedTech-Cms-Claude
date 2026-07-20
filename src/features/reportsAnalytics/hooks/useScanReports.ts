import { useEffect, useReducer } from 'react'
import { scanReportsService } from '@/features/reportsAnalytics/services/scanReportsService'
import type { ScanReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import type { scanReportKpis } from '@/features/reports/mockScanReports'

type ScanReportKpis = typeof scanReportKpis

interface FilterOptions {
  productOptions: string[]
  dealerOptions: string[]
  chemistOptions: string[]
}

interface State {
  reports: ScanReportEntry[]
  kpis: ScanReportKpis | null
  filterOptions: FilterOptions | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; reports: ScanReportEntry[]; kpis: ScanReportKpis; filterOptions: FilterOptions }
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

export function useScanReports() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      scanReportsService.getScanReports(),
      scanReportsService.getScanReportKpis(),
      scanReportsService.getScanReportFilterOptions(),
    ])
      .then(([reports, kpis, filterOptions]) => {
        if (!cancelled) dispatch({ type: 'succeeded', reports, kpis, filterOptions })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load scan reports.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
