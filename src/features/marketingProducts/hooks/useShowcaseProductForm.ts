import { useEffect, useReducer, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { showcaseProductsService } from '@/features/marketingProducts/services/showcaseProductsService'
import type { ShowcaseProduct, ShowcaseProductFormValues } from '@/features/marketingProducts/types/marketingProducts.types'

interface LoadState {
  product: ShowcaseProduct | undefined
  categoryOptions: string[]
  isLoading: boolean
  loadError: string | null
}

type LoadAction =
  | { type: 'loading' }
  | { type: 'succeeded'; product: ShowcaseProduct | undefined; categoryOptions: string[] }
  | { type: 'failed'; error: string }

const initialLoadState: LoadState = { product: undefined, categoryOptions: [], isLoading: false, loadError: null }

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

export function useShowcaseProductForm(productId: string | undefined) {
  const isEdit = !!productId
  const toast = useToast()
  const [loadState, dispatch] = useReducer(loadReducer, initialLoadState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      productId ? showcaseProductsService.getShowcaseProductDetail(productId) : Promise.resolve(undefined),
      showcaseProductsService.getShowcaseCategoryOptions(),
    ])
      .then(([product, categoryOptions]) => {
        if (!cancelled) dispatch({ type: 'succeeded', product, categoryOptions })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load product form data.' })
      })

    return () => {
      cancelled = true
    }
  }, [productId])

  async function submit(values: ShowcaseProductFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && productId) {
        await showcaseProductsService.updateShowcaseProduct(productId, values)
      } else {
        await showcaseProductsService.createShowcaseProduct(values)
      }
      toast.success(isEdit ? 'Product updated successfully.' : 'Product created successfully.')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save product.'
      setSubmitError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isEdit, ...loadState, isSubmitting, error: loadState.loadError ?? submitError, submit }
}
