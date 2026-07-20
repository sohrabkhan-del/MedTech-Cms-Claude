import { useEffect, useReducer } from 'react'
import { securityAlertsService } from '@/features/fieldOperations/services/securityAlertsService'
import type { SecurityAlert } from '@/features/fieldOperations/types/fieldOperations.types'
import type { securityAlertKpis } from '@/features/fieldOperations/mocks/mockSecurityAlerts'

type SecurityAlertKpis = typeof securityAlertKpis

interface State {
  alerts: SecurityAlert[]
  kpis: SecurityAlertKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; alerts: SecurityAlert[]; kpis: SecurityAlertKpis }
  | { type: 'failed'; error: string }

const initialState: State = { alerts: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { alerts: action.alerts, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useSecurityAlerts() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([securityAlertsService.getSecurityAlerts(), securityAlertsService.getSecurityAlertKpis()])
      .then(([alerts, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', alerts, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load security alerts.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
