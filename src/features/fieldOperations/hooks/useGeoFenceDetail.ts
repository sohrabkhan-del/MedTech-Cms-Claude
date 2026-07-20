import { useEffect, useReducer, useState } from 'react'
import { geoFencesService } from '@/features/fieldOperations/services/geoFencesService'
import type { GeoFence } from '@/features/fieldOperations/types/fieldOperations.types'

interface State {
  geoFence: GeoFence | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; geoFence: GeoFence | undefined }
  | { type: 'failed'; error: string }

const initialState: State = { geoFence: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { geoFence: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { geoFence: action.geoFence, isLoading: false, error: null }
    case 'failed':
      return { geoFence: undefined, isLoading: false, error: action.error }
  }
}

export function useGeoFenceDetail(fenceId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isMutating, setIsMutating] = useState(false)

  useEffect(() => {
    if (!fenceId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    geoFencesService
      .getGeoFenceDetail(fenceId)
      .then((geoFence) => {
        if (!cancelled) dispatch({ type: 'succeeded', geoFence })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load geo fence.' })
      })

    return () => {
      cancelled = true
    }
  }, [fenceId])

  async function setStatus(status: 'active' | 'inactive') {
    if (!fenceId) return
    setIsMutating(true)
    try {
      await geoFencesService.setGeoFenceStatus(fenceId, status)
    } finally {
      setIsMutating(false)
    }
  }

  async function remove() {
    if (!fenceId) return
    setIsMutating(true)
    try {
      await geoFencesService.deleteGeoFence(fenceId)
    } finally {
      setIsMutating(false)
    }
  }

  return { ...state, isMutating, setStatus, remove }
}
