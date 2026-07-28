import { useCallback, useEffect, useReducer } from 'react'
import { schemesService } from '@/features/schemeManagement/services/schemesService'
import type { Scheme, SchemeStatus } from '@/features/schemeManagement/types/schemeManagement.types'

interface State {
  scheme: Scheme | undefined
  isLoading: boolean
  error: string | null
}

type Action = { type: 'loading' } | { type: 'succeeded'; scheme: Scheme | undefined } | { type: 'failed'; error: string }

const initialState: State = { scheme: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { scheme: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { scheme: action.scheme, isLoading: false, error: null }
    case 'failed':
      return { scheme: undefined, isLoading: false, error: action.error }
  }
}

export function useSchemeDetail(schemeId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const load = useCallback(() => {
    if (!schemeId) return () => {}

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

  useEffect(() => load(), [load])

  async function remove() {
    if (!schemeId) return
    await schemesService.deleteScheme(schemeId)
  }

  async function setStatus(status: SchemeStatus) {
    if (!schemeId) return
    const updated = await schemesService.updateSchemeStatus(schemeId, status)
    if (updated) dispatch({ type: 'succeeded', scheme: updated })
  }

  return { ...state, remove, setStatus }
}
