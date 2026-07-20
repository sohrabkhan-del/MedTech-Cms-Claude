import { useEffect, useReducer } from 'react'
import { chemistReportsService } from '@/features/reportsAnalytics/services/chemistReportsService'
import type { ChemistPerformanceSummary, ChemistReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

interface State {
  report: ChemistReportRow | undefined
  summary: ChemistPerformanceSummary | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; report: ChemistReportRow | undefined; summary: ChemistPerformanceSummary | undefined }
  | { type: 'failed'; error: string }

const initialState: State = { report: undefined, summary: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { report: undefined, summary: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { report: action.report, summary: action.summary, isLoading: false, error: null }
    case 'failed':
      return { report: undefined, summary: undefined, isLoading: false, error: action.error }
  }
}

export function useChemistReportDetail(chemistReportId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!chemistReportId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      chemistReportsService.getChemistReportDetail(chemistReportId),
      chemistReportsService.getChemistPerformanceSummary(chemistReportId),
    ])
      .then(([report, summary]) => {
        if (!cancelled) dispatch({ type: 'succeeded', report, summary })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load chemist report.' })
      })

    return () => {
      cancelled = true
    }
  }, [chemistReportId])

  return state
}
