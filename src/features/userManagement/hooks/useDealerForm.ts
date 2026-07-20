import { useEffect, useReducer, useState } from 'react'
import { partnersService } from '@/features/userManagement/services/partnersService'
import type { Dealer, DealerFormValues } from '@/features/userManagement/types/userManagement.types'

interface LoadState {
  dealer: Dealer | undefined
  mrOptions: string[]
  isLoading: boolean
  loadError: string | null
}

type LoadAction =
  | { type: 'loading' }
  | { type: 'succeeded'; dealer: Dealer | undefined; mrOptions: string[] }
  | { type: 'failed'; error: string }

const initialLoadState: LoadState = { dealer: undefined, mrOptions: [], isLoading: false, loadError: null }

function loadReducer(state: LoadState, action: LoadAction): LoadState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, loadError: null }
    case 'succeeded':
      return { dealer: action.dealer, mrOptions: action.mrOptions, isLoading: false, loadError: null }
    case 'failed':
      return { ...state, isLoading: false, loadError: action.error }
  }
}

export function useDealerForm(dealerId: string | undefined) {
  const isEdit = !!dealerId
  const [loadState, dispatch] = useReducer(loadReducer, initialLoadState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      dealerId ? partnersService.getDealerDetail(dealerId) : Promise.resolve(undefined),
      partnersService.getMrOptions(),
    ])
      .then(([dealer, mrOptions]) => {
        if (!cancelled) dispatch({ type: 'succeeded', dealer, mrOptions })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load dealer form data.' })
      })

    return () => {
      cancelled = true
    }
  }, [dealerId])

  async function submit(values: DealerFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && dealerId) {
        await partnersService.updateDealer(dealerId, values)
      } else {
        await partnersService.createDealer(values)
      }
      return true
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save dealer.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isEdit, ...loadState, isSubmitting, error: loadState.loadError ?? submitError, submit }
}
