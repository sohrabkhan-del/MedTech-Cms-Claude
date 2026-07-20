import { useEffect, useReducer } from 'react'
import { masterScanLogsService } from '@/features/audit/services/masterScanLogsService'
import type { MasterScanLogEntry } from '@/features/audit/types/audit.types'
import type { masterScanLogKpis } from '@/features/audit/mockMasterScanLogs'

type MasterScanLogKpis = typeof masterScanLogKpis

interface FilterOptions {
  distributorOptions: string[]
  dealerOptions: string[]
  chemistOptions: string[]
  batchOptions: string[]
  productOptions: string[]
}

interface State {
  logs: MasterScanLogEntry[]
  kpis: MasterScanLogKpis | null
  filterOptions: FilterOptions | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; logs: MasterScanLogEntry[]; kpis: MasterScanLogKpis; filterOptions: FilterOptions }
  | { type: 'failed'; error: string }

const initialState: State = { logs: [], kpis: null, filterOptions: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { logs: action.logs, kpis: action.kpis, filterOptions: action.filterOptions, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useMasterScanLogs() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      masterScanLogsService.getMasterScanLogs(),
      masterScanLogsService.getMasterScanLogKpis(),
      masterScanLogsService.getMasterScanLogFilterOptions(),
    ])
      .then(([logs, kpis, filterOptions]) => {
        if (!cancelled) dispatch({ type: 'succeeded', logs, kpis, filterOptions })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load master scan logs.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
