import { useEffect, useReducer } from 'react'
import { walletReportsService } from '@/features/reportsAnalytics/services/walletReportsService'
import type { WalletReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import type { walletReportKpis } from '@/features/reports/mockWalletReports'

type WalletReportKpis = typeof walletReportKpis

interface State {
  reports: WalletReportRow[]
  kpis: WalletReportKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; reports: WalletReportRow[]; kpis: WalletReportKpis }
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

export function useWalletReports() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([walletReportsService.getWalletReports(), walletReportsService.getWalletReportKpis()])
      .then(([reports, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', reports, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load wallet reports.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
