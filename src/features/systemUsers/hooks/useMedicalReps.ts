import { useEffect, useReducer } from 'react'
import { medicalRepsService } from '@/features/systemUsers/services/medicalRepsService'
import type { MedicalRepresentative } from '@/features/systemUsers/types/systemUsers.types'
import type { mrKpis } from '@/features/systemUsers/mockMedicalReps'

type MrKpis = typeof mrKpis

interface State {
  medicalReps: MedicalRepresentative[]
  kpis: MrKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; medicalReps: MedicalRepresentative[]; kpis: MrKpis }
  | { type: 'failed'; error: string }

const initialState: State = { medicalReps: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { medicalReps: action.medicalReps, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useMedicalReps() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([medicalRepsService.getMedicalReps(), medicalRepsService.getMedicalRepKpis()])
      .then(([medicalReps, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', medicalReps, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load medical representatives.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
