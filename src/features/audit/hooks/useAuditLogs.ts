import { useEffect, useReducer } from 'react'
import { auditLogsService } from '@/features/audit/services/auditLogsService'
import type { AuditActionType, AuditEntityType, AuditLogEntry, AuditModule, AuditUserRole } from '@/features/audit/types/audit.types'
import type { auditLogKpis } from '@/features/audit/mockAuditLogs'

type AuditLogKpis = typeof auditLogKpis

interface FilterOptions {
  moduleOptions: AuditModule[]
  actionOptions: AuditActionType[]
  entityOptions: AuditEntityType[]
  userRoleOptions: AuditUserRole[]
}

interface State {
  logs: AuditLogEntry[]
  kpis: AuditLogKpis | null
  filterOptions: FilterOptions | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; logs: AuditLogEntry[]; kpis: AuditLogKpis; filterOptions: FilterOptions }
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

export function useAuditLogs() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([auditLogsService.getAuditLogs(), auditLogsService.getAuditLogKpis(), auditLogsService.getAuditLogFilterOptions()])
      .then(([logs, kpis, filterOptions]) => {
        if (!cancelled) dispatch({ type: 'succeeded', logs, kpis, filterOptions })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load audit logs.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
