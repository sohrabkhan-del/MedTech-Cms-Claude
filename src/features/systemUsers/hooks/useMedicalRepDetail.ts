import { useEffect, useReducer } from 'react'
import { medicalRepsService } from '@/features/systemUsers/services/medicalRepsService'
import type { MedicalRepresentative, PartnerStatus } from '@/features/systemUsers/types/systemUsers.types'

interface State {
  mr: MedicalRepresentative | undefined
  replacementOptions: MedicalRepresentative[]
  statusOverride: PartnerStatus | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; mr: MedicalRepresentative | undefined; replacementOptions: MedicalRepresentative[] }
  | { type: 'failed'; error: string }
  | { type: 'statusChanged'; status: PartnerStatus }

const initialState: State = { mr: undefined, replacementOptions: [], statusOverride: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { mr: undefined, replacementOptions: [], statusOverride: null, isLoading: true, error: null }
    case 'succeeded':
      return { mr: action.mr, replacementOptions: action.replacementOptions, statusOverride: null, isLoading: false, error: null }
    case 'failed':
      return { mr: undefined, replacementOptions: [], statusOverride: null, isLoading: false, error: action.error }
    case 'statusChanged':
      return { ...state, statusOverride: action.status }
  }
}

export function useMedicalRepDetail(mrId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!mrId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    medicalRepsService
      .getMedicalRepDetail(mrId)
      .then(async (mr) => {
        const replacementOptions = mr ? await medicalRepsService.getReplacementMrs(mr.region, mr.id) : []
        if (!cancelled) dispatch({ type: 'succeeded', mr, replacementOptions })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load medical representative.' })
      })

    return () => {
      cancelled = true
    }
  }, [mrId])

  async function setStatus(status: PartnerStatus) {
    if (!mrId) return
    await medicalRepsService.setMedicalRepStatus(mrId, status)
    dispatch({ type: 'statusChanged', status })
  }

  async function remove(replacementMrId: string) {
    if (!mrId) return
    await medicalRepsService.deleteMedicalRep(mrId, replacementMrId)
  }

  const mr = state.mr && state.statusOverride ? { ...state.mr, status: state.statusOverride } : state.mr

  return { ...state, mr, setStatus, remove }
}
