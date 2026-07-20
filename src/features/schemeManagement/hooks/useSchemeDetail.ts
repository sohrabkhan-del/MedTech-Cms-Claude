import { useEffect, useReducer } from 'react'
import { schemesService } from '@/features/schemeManagement/services/schemesService'
import type { Scheme, SchemeStatus } from '@/features/schemeManagement/types/schemeManagement.types'

interface State {
  scheme: Scheme | undefined
  statusOverride: SchemeStatus | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; scheme: Scheme | undefined }
  | { type: 'failed'; error: string }
  | { type: 'statusChanged'; status: SchemeStatus }

const initialState: State = { scheme: undefined, statusOverride: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { scheme: undefined, statusOverride: null, isLoading: true, error: null }
    case 'succeeded':
      return { scheme: action.scheme, statusOverride: null, isLoading: false, error: null }
    case 'failed':
      return { scheme: undefined, statusOverride: null, isLoading: false, error: action.error }
    case 'statusChanged':
      return { ...state, statusOverride: action.status }
  }
}

export function useSchemeDetail(schemeId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!schemeId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    schemesService
      .getSchemeDetail(schemeId)
      .then((scheme) => {
        if (!cancelled) dispatch({ type: 'succeeded', scheme })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load scheme.' })
      })

    return () => {
      cancelled = true
    }
  }, [schemeId])

  async function setStatus(status: SchemeStatus) {
    if (!schemeId) return
    await schemesService.setSchemeStatus(schemeId, status)
    dispatch({ type: 'statusChanged', status })
  }

  async function remove() {
    if (!schemeId) return
    await schemesService.deleteScheme(schemeId)
  }

  const scheme = state.scheme && state.statusOverride ? { ...state.scheme, status: state.statusOverride } : state.scheme

  return { ...state, scheme, setStatus, remove }
}
