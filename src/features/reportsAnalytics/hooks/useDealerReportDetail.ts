import { useEffect, useReducer } from 'react'
import { dealerReportsService } from '@/features/reportsAnalytics/services/dealerReportsService'
import type { DealerReportDetails } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

interface State {
  report: DealerReportDetails | undefined
  isLoading: boolean
  error: string | null
}

type Action = { type: 'loading' } | { type: 'succeeded'; report: DealerReportDetails | undefined } | { type: 'failed'; error: string }

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

export function useDealerReportDetail(dealerReportId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!dealerReportId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    dealerReportsService
      .getDealerReportDetail(dealerReportId)
      .then((report) => {
        if (!cancelled) dispatch({ type: 'succeeded', report })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load dealer report.' })
      })

    return () => {
      cancelled = true
    }
  }, [dealerReportId])

  return state
}
