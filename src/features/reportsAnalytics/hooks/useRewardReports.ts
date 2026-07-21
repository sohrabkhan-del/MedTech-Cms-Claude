import { useEffect, useReducer } from 'react'
import { rewardReportsService } from '@/features/reportsAnalytics/services/rewardReportsService'
import type { RewardReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import type { rewardReportKpis } from '@/features/reportsAnalytics/mockRewardReports'

type RewardReportKpis = typeof rewardReportKpis

interface FilterOptions {
  userTypeOptions: string[]
  rewardTypeOptions: string[]
  schemeOptions: string[]
  statusOptions: string[]
}

interface State {
  reports: RewardReportEntry[]
  kpis: RewardReportKpis | null
  filterOptions: FilterOptions | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; reports: RewardReportEntry[]; kpis: RewardReportKpis; filterOptions: FilterOptions }
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

export function useRewardReports() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      rewardReportsService.getRewardReports(),
      rewardReportsService.getRewardReportKpis(),
      rewardReportsService.getRewardReportFilterOptions(),
    ])
      .then(([reports, kpis, filterOptions]) => {
        if (!cancelled) dispatch({ type: 'succeeded', reports, kpis, filterOptions })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load reward reports.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
