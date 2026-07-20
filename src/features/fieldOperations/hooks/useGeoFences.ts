import { useEffect, useReducer } from 'react'
import { geoFencesService } from '@/features/fieldOperations/services/geoFencesService'
import type { GeoFence } from '@/features/fieldOperations/types/fieldOperations.types'
import type { geoFenceKpis } from '@/features/fieldOperations/mocks/mockGeoFences'

type GeoFenceKpis = typeof geoFenceKpis

interface State {
  geoFences: GeoFence[]
  kpis: GeoFenceKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; geoFences: GeoFence[]; kpis: GeoFenceKpis }
  | { type: 'failed'; error: string }

const initialState: State = { geoFences: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { geoFences: action.geoFences, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useGeoFences() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([geoFencesService.getGeoFences(), geoFencesService.getGeoFenceKpis()])
      .then(([geoFences, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', geoFences, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load geo fences.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
