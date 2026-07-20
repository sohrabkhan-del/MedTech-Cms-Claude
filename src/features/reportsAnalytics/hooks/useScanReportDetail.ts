import { useEffect, useReducer } from 'react'
import { scanReportsService } from '@/features/reportsAnalytics/services/scanReportsService'
import type { ScanReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

interface State {
  report: ScanReportEntry | undefined
  isLoading: boolean
  error: string | null
}

type Action = { type: 'loading' } | { type: 'succeeded'; report: ScanReportEntry | undefined } | { type: 'failed'; error: string }

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

export function useScanReportDetail(scanId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!scanId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    scanReportsService
      .getScanReportDetail(scanId)
      .then((report) => {
        if (!cancelled) dispatch({ type: 'succeeded', report })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load scan report.' })
      })

    return () => {
      cancelled = true
    }
  }, [scanId])

  return state
}
