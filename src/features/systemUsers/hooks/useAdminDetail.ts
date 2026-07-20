import { useEffect, useReducer } from 'react'
import { adminsService } from '@/features/systemUsers/services/adminsService'
import type { Admin, AdminStatus } from '@/features/systemUsers/types/systemUsers.types'

interface State {
  admin: Admin | undefined
  statusOverride: AdminStatus | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; admin: Admin | undefined }
  | { type: 'failed'; error: string }
  | { type: 'statusChanged'; status: AdminStatus }

const initialState: State = { admin: undefined, statusOverride: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { admin: undefined, statusOverride: null, isLoading: true, error: null }
    case 'succeeded':
      return { admin: action.admin, statusOverride: null, isLoading: false, error: null }
    case 'failed':
      return { admin: undefined, statusOverride: null, isLoading: false, error: action.error }
    case 'statusChanged':
      return { ...state, statusOverride: action.status }
  }
}

export function useAdminDetail(adminId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!adminId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    adminsService
      .getAdminDetail(adminId)
      .then((admin) => {
        if (!cancelled) dispatch({ type: 'succeeded', admin })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load admin.' })
      })

    return () => {
      cancelled = true
    }
  }, [adminId])

  async function setStatus(status: AdminStatus) {
    if (!adminId) return
    await adminsService.setAdminStatus(adminId, status)
    dispatch({ type: 'statusChanged', status })
  }

  const admin = state.admin && state.statusOverride ? { ...state.admin, status: state.statusOverride } : state.admin

  return { ...state, admin, setStatus }
}
