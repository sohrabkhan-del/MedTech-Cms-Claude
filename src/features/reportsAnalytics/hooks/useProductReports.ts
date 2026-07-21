import { useEffect, useReducer } from 'react'
import { productReportsService } from '@/features/reportsAnalytics/services/productReportsService'
import type { ProductReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import type { productReportKpis } from '@/features/reportsAnalytics/mockProductReports'

type ProductReportKpis = typeof productReportKpis

interface FilterOptions {
  categoryOptions: string[]
  batchOptions: string[]
}

interface State {
  reports: ProductReportEntry[]
  kpis: ProductReportKpis | null
  filterOptions: FilterOptions | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; reports: ProductReportEntry[]; kpis: ProductReportKpis; filterOptions: FilterOptions }
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

export function useProductReports() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      productReportsService.getProductReports(),
      productReportsService.getProductReportKpis(),
      productReportsService.getProductReportFilterOptions(),
    ])
      .then(([reports, kpis, filterOptions]) => {
        if (!cancelled) dispatch({ type: 'succeeded', reports, kpis, filterOptions })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load product reports.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
