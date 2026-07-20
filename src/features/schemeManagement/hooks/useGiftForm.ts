import { useEffect, useReducer, useState } from 'react'
import { giftsService } from '@/features/schemeManagement/services/giftsService'
import type { Gift, GiftFormValues } from '@/features/schemeManagement/types/schemeManagement.types'

interface FormOptions {
  giftCategoryOptions: string[]
  giftBrandOptions: string[]
}

interface LoadState {
  gift: Gift | undefined
  options: FormOptions | null
  isLoading: boolean
  loadError: string | null
}

type LoadAction =
  | { type: 'loading' }
  | { type: 'succeeded'; gift: Gift | undefined; options: FormOptions }
  | { type: 'failed'; error: string }

const initialLoadState: LoadState = { gift: undefined, options: null, isLoading: false, loadError: null }

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

export function useGiftForm(giftId: string | undefined) {
  const isEdit = !!giftId
  const [loadState, dispatch] = useReducer(loadReducer, initialLoadState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      giftId ? giftsService.getGiftDetail(giftId) : Promise.resolve(undefined),
      giftsService.getGiftFormOptions(),
    ])
      .then(([gift, options]) => {
        if (!cancelled) dispatch({ type: 'succeeded', gift, options })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load gift form data.' })
      })

    return () => {
      cancelled = true
    }
  }, [giftId])

  async function submit(values: GiftFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && giftId) {
        await giftsService.updateGift(giftId, values)
      } else {
        await giftsService.createGift(values)
      }
      return true
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save gift.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isEdit, ...loadState, isSubmitting, error: loadState.loadError ?? submitError, submit }
}
