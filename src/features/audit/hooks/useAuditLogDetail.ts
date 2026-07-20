import { useEffect, useReducer } from 'react'
import { auditLogsService } from '@/features/audit/services/auditLogsService'
import type { AuditLogEntry } from '@/features/audit/types/audit.types'

interface State {
  log: AuditLogEntry | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; log: AuditLogEntry | undefined }
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

export function useAuditLogDetail(logId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!logId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    auditLogsService
      .getAuditLogDetail(logId)
      .then((log) => {
        if (!cancelled) dispatch({ type: 'succeeded', log })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load audit log.' })
      })

    return () => {
      cancelled = true
    }
  }, [logId])

  return state
}
