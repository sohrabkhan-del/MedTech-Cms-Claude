import { useEffect, useReducer } from 'react'
import { schemeReportsService } from '@/features/reportsAnalytics/services/schemeReportsService'
import type { SchemeReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

interface State {
  report: SchemeReportEntry | undefined
  isLoading: boolean
  error: string | null
}

type Action = { type: 'loading' } | { type: 'succeeded'; report: SchemeReportEntry | undefined } | { type: 'failed'; error: string }

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

export function useSchemeReportDetail(schemeReportId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!schemeReportId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    schemeReportsService
      .getSchemeReportDetail(schemeReportId)
      .then((report) => {
        if (!cancelled) dispatch({ type: 'succeeded', report })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load scheme report.' })
      })

    return () => {
      cancelled = true
    }
  }, [schemeReportId])

  return state
}
