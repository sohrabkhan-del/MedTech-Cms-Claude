import { useEffect, useReducer } from 'react'
import { schemesService } from '@/features/schemeManagement/services/schemesService'
import type { Scheme } from '@/features/schemeManagement/types/schemeManagement.types'
import type { seasonalSchemeKpis } from '@/features/schemes/mockSchemes'

type SeasonalSchemeKpis = typeof seasonalSchemeKpis

interface State {
  schemes: Scheme[]
  kpis: SeasonalSchemeKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; schemes: Scheme[]; kpis: SeasonalSchemeKpis }
  | { type: 'failed'; error: string }

const initialState: State = { schemes: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { schemes: action.schemes, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useSeasonalSchemes() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([schemesService.getSeasonalSchemes(), schemesService.getSeasonalSchemeKpis()])
      .then(([schemes, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', schemes, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load seasonal schemes.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
