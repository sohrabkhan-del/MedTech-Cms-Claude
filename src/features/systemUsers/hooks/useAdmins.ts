import { useEffect, useReducer } from 'react'
import { adminsService } from '@/features/systemUsers/services/adminsService'
import type { Admin } from '@/features/systemUsers/types/systemUsers.types'
import type { adminKpis } from '@/features/systemUsers/mockAdmins'

type AdminKpis = typeof adminKpis

interface State {
  admins: Admin[]
  kpis: AdminKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; admins: Admin[]; kpis: AdminKpis }
  | { type: 'failed'; error: string }

const initialState: State = { admins: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { admins: action.admins, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useAdmins() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([adminsService.getAdmins(), adminsService.getAdminKpis()])
      .then(([admins, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', admins, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load admins.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
