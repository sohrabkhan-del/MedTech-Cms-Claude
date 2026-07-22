import { useEffect, useReducer, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { productsService } from '@/features/inventoryManagement/services/productsService'
import type { Product, ProductFormValues } from '@/features/inventoryManagement/types/inventoryManagement.types'

interface LoadState {
  product: Product | undefined
  cloneSource: Product | undefined
  categoryOptions: string[]
  isLoading: boolean
  loadError: string | null
}

type LoadAction =
  | { type: 'loading' }
  | { type: 'succeeded'; product: Product | undefined; cloneSource: Product | undefined; categoryOptions: string[] }
  | { type: 'failed'; error: string }

const initialLoadState: LoadState = { product: undefined, cloneSource: undefined, categoryOptions: [], isLoading: false, loadError: null }

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

export function useProductForm(productId: string | undefined, cloneFromId: string | null) {
  const isEdit = !!productId
  const toast = useToast()
  const [loadState, dispatch] = useReducer(loadReducer, initialLoadState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      productId ? productsService.getProductDetail(productId) : Promise.resolve(undefined),
      !productId && cloneFromId ? productsService.getProductDetail(cloneFromId) : Promise.resolve(undefined),
      productsService.getProductCategoryOptions(),
    ])
      .then(([product, cloneSource, categoryOptions]) => {
        if (!cancelled) dispatch({ type: 'succeeded', product, cloneSource, categoryOptions })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load product form data.' })
      })

    return () => {
      cancelled = true
    }
  }, [productId, cloneFromId])

  async function submit(values: ProductFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && productId) {
        await productsService.updateProduct(productId, values)
      } else {
        await productsService.createProduct(values)
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
