import { useEffect, useReducer } from 'react'
import { securityAlertsService } from '@/features/fieldOperations/services/securityAlertsService'
import type { UserSecuritySummary, SecurityAlert, SecurityTimelineEntry } from '@/types/securityAlert'

interface State {
  summary: UserSecuritySummary | undefined
  alertHistory: SecurityAlert[]
  timeline: SecurityTimelineEntry[]
  statusOverride: 'active' | 'inactive' | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; summary: UserSecuritySummary | undefined; alertHistory: SecurityAlert[]; timeline: SecurityTimelineEntry[] }
  | { type: 'failed'; error: string }
  | { type: 'statusChanged'; status: 'active' | 'inactive' }

const initialState: State = { summary: undefined, alertHistory: [], timeline: [], statusOverride: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { summary: undefined, alertHistory: [], timeline: [], statusOverride: null, isLoading: true, error: null }
    case 'succeeded':
      return { ...action, statusOverride: null, isLoading: false, error: null }
    case 'failed':
      return { summary: undefined, alertHistory: [], timeline: [], statusOverride: null, isLoading: false, error: action.error }
    case 'statusChanged':
      return { ...state, statusOverride: action.status }
  }
}

export function useSecurityAlertUserProfile(userId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    securityAlertsService
      .getUserSecurityProfile(userId)
      .then(({ summary, alertHistory, timeline }) => {
        if (!cancelled) dispatch({ type: 'succeeded', summary, alertHistory, timeline })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load user security profile.' })
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  async function setStatus(status: 'active' | 'inactive') {
    if (!userId) return
    await securityAlertsService.setUserStatus(userId, status)
    dispatch({ type: 'statusChanged', status })
  }

  return { ...state, currentStatus: state.statusOverride ?? state.summary?.status, setStatus }
}
