import { useEffect, useReducer } from 'react'
import { rewardReportsService } from '@/features/reportsAnalytics/services/rewardReportsService'
import type { RewardReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

interface State {
  report: RewardReportEntry | undefined
  isLoading: boolean
  error: string | null
}

type Action = { type: 'loading' } | { type: 'succeeded'; report: RewardReportEntry | undefined } | { type: 'failed'; error: string }

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

export function useRewardReportDetail(rewardId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!rewardId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    rewardReportsService
      .getRewardReportDetail(rewardId)
      .then((report) => {
        if (!cancelled) dispatch({ type: 'succeeded', report })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load reward report.' })
      })

    return () => {
      cancelled = true
    }
  }, [rewardId])

  return state
}
