import { useEffect, useReducer } from 'react'
import { walletReportsService } from '@/features/reportsAnalytics/services/walletReportsService'
import type { WalletReportDetails } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

interface State {
  report: WalletReportDetails | undefined
  isLoading: boolean
  error: string | null
}

type Action = { type: 'loading' } | { type: 'succeeded'; report: WalletReportDetails | undefined } | { type: 'failed'; error: string }

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

export function useWalletReportDetail(walletReportId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!walletReportId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    walletReportsService
      .getWalletReportDetail(walletReportId)
      .then((report) => {
        if (!cancelled) dispatch({ type: 'succeeded', report })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load wallet report.' })
      })

    return () => {
      cancelled = true
    }
  }, [walletReportId])

  return state
}
