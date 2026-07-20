import { useEffect, useReducer, useState } from 'react'
import { geoFencesService } from '@/features/fieldOperations/services/geoFencesService'
import type { GeoFence, GeoFenceFormValues } from '@/features/fieldOperations/types/fieldOperations.types'

interface UserOption {
  id: string
  name: string
  userType: GeoFence['userType']
}

interface LoadState {
  fence: GeoFence | undefined
  userOptions: UserOption[]
  isLoading: boolean
  loadError: string | null
}

type LoadAction =
  | { type: 'loading' }
  | { type: 'succeeded'; fence: GeoFence | undefined; userOptions: UserOption[] }
  | { type: 'failed'; error: string }

const initialLoadState: LoadState = { fence: undefined, userOptions: [], isLoading: false, loadError: null }

function loadReducer(state: LoadState, action: LoadAction): LoadState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, loadError: null }
    case 'succeeded':
      return { fence: action.fence, userOptions: action.userOptions, isLoading: false, loadError: null }
    case 'failed':
      return { ...state, isLoading: false, loadError: action.error }
  }
}

export function useGeoFenceForm(fenceId: string | undefined) {
  const isEdit = !!fenceId
  const [loadState, dispatch] = useReducer(loadReducer, initialLoadState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      fenceId ? geoFencesService.getGeoFenceDetail(fenceId) : Promise.resolve(undefined),
      geoFencesService.getGeoFenceUserOptions(),
    ])
      .then(([fence, userOptions]) => {
        if (!cancelled) dispatch({ type: 'succeeded', fence, userOptions })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load geo fence form data.' })
      })

    return () => {
      cancelled = true
    }
  }, [fenceId])

  async function submit(values: GeoFenceFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && fenceId) {
        await geoFencesService.updateGeoFence(fenceId, values)
      } else {
        await geoFencesService.createGeoFence(values)
      }
      return true
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save geo fence.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isEdit, ...loadState, isSubmitting, error: loadState.loadError ?? submitError, submit }
}
