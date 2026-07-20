import { useEffect, useReducer } from 'react'
import { productReportsService } from '@/features/reportsAnalytics/services/productReportsService'
import type { ProductReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

interface State {
  report: ProductReportEntry | undefined
  isLoading: boolean
  error: string | null
}

type Action = { type: 'loading' } | { type: 'succeeded'; report: ProductReportEntry | undefined } | { type: 'failed'; error: string }

const initialState: State = { report: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { report: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { report: action.report, isLoading: false, error: null }
    case 'failed':
      return { report: undefined, isLoading: false, error: action.error }
  }
}

export function useProductReportDetail(productReportId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!productReportId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    productReportsService
      .getProductReportDetail(productReportId)
      .then((report) => {
        if (!cancelled) dispatch({ type: 'succeeded', report })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load product report.' })
      })

    return () => {
      cancelled = true
    }
  }, [productReportId])

  return state
}
