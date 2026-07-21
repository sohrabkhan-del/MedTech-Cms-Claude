import { useEffect, useReducer } from 'react'
import { chemistReportsService } from '@/features/reportsAnalytics/services/chemistReportsService'
import type { ChemistReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import type { chemistReportKpis } from '@/features/reportsAnalytics/mockChemistReports'

type ChemistReportKpis = typeof chemistReportKpis

interface State {
  reports: ChemistReportRow[]
  kpis: ChemistReportKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; reports: ChemistReportRow[]; kpis: ChemistReportKpis }
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

export function useChemistReports() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([chemistReportsService.getChemistReports(), chemistReportsService.getChemistReportKpis()])
      .then(([reports, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', reports, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load chemist reports.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
