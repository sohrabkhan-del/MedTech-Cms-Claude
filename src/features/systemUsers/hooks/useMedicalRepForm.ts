import { useEffect, useReducer, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { medicalRepsService } from '@/features/systemUsers/services/medicalRepsService'
import type { MedicalRepFormValues, MedicalRepresentative, PartnerStatus, PartnerZone } from '@/features/systemUsers/types/systemUsers.types'

interface FormOptions {
  regionOptions: PartnerZone[]
  statusOptions: PartnerStatus[]
}

interface LoadState {
  mr: MedicalRepresentative | undefined
  options: FormOptions | null
  isLoading: boolean
  loadError: string | null
}

type LoadAction =
  | { type: 'loading' }
  | { type: 'succeeded'; mr: MedicalRepresentative | undefined; options: FormOptions }
  | { type: 'failed'; error: string }

const initialLoadState: LoadState = { mr: undefined, options: null, isLoading: false, loadError: null }

function loadReducer(state: LoadState, action: LoadAction): LoadState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, loadError: null }
    case 'succeeded':
      return { ...action, isLoading: false, loadError: null }
    case 'failed':
      return { ...state, isLoading: false, loadError: action.error }
  }
}

export function useMedicalRepForm(mrId: string | undefined) {
  const isEdit = !!mrId
  const toast = useToast()
  const [loadState, dispatch] = useReducer(loadReducer, initialLoadState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      mrId ? medicalRepsService.getMedicalRepDetail(mrId) : Promise.resolve(undefined),
      medicalRepsService.getMedicalRepFormOptions(),
    ])
      .then(([mr, options]) => {
        if (!cancelled) dispatch({ type: 'succeeded', mr, options })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load medical representative form data.' })
      })

    return () => {
      cancelled = true
    }
  }, [mrId])

  async function submit(values: MedicalRepFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && mrId) {
        await medicalRepsService.updateMedicalRep(mrId, values)
      } else {
        await medicalRepsService.createMedicalRep(values)
      }
      toast.success(isEdit ? 'Medical rep updated successfully.' : 'Medical rep created successfully.')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save medical representative.'
      setSubmitError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isEdit, ...loadState, isSubmitting, error: loadState.loadError ?? submitError, submit }
}
