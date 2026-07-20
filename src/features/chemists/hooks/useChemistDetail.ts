import { useEffect, useReducer } from 'react'
import { chemistService } from '@/features/chemists/services/chemistService'
import type { Chemist } from '@/features/chemists/types/chemist.types'

interface ChemistDetailState {
  chemist: Chemist | undefined
  isLoading: boolean
  error: string | null
}

type ChemistDetailAction =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'succeeded'; chemist: Chemist | undefined }
  | { type: 'failed'; error: string }

const idleState: ChemistDetailState = { chemist: undefined, isLoading: false, error: null }

function reducer(_state: ChemistDetailState, action: ChemistDetailAction): ChemistDetailState {
  switch (action.type) {
    case 'idle':
      return idleState
    case 'loading':
      return { chemist: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { chemist: action.chemist, isLoading: false, error: null }
    case 'failed':
      return { chemist: undefined, isLoading: false, error: action.error }
  }
}

export function useChemistDetail(chemistId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, idleState)

  useEffect(() => {
    if (!chemistId) {
      dispatch({ type: 'idle' })
      return
    }

    let cancelled = false
    dispatch({ type: 'loading' })

    chemistService
      .getChemistDetail(chemistId)
      .then((result) => {
        if (!cancelled) dispatch({ type: 'succeeded', chemist: result })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load chemist.' })
      })

    return () => {
      cancelled = true
    }
  }, [chemistId])

  return state
}
