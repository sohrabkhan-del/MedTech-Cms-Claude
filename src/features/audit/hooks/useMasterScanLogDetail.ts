import { useEffect, useReducer } from 'react'
import { masterScanLogsService } from '@/features/audit/services/masterScanLogsService'
import type { MasterScanLogEntry } from '@/features/audit/types/audit.types'

interface State {
  log: MasterScanLogEntry | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; log: MasterScanLogEntry | undefined }
  | { type: 'failed'; error: string }

const initialState: State = { log: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { log: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { log: action.log, isLoading: false, error: null }
    case 'failed':
      return { log: undefined, isLoading: false, error: action.error }
  }
}

export function useMasterScanLogDetail(logId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!logId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    masterScanLogsService
      .getMasterScanLogDetail(logId)
      .then((log) => {
        if (!cancelled) dispatch({ type: 'succeeded', log })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load master scan log.' })
      })

    return () => {
      cancelled = true
    }
  }, [logId])

  return state
}
