import { useEffect, useReducer, useState } from 'react'
import { productCategoriesService } from '@/features/masters/services/productCategoriesService'
import type { ProductCategory, ProductCategoryFormValues } from '@/features/masters/types/masters.types'

interface FormOptions {
  parentCategoryOptions: ProductCategory[]
}

interface LoadState {
  category: ProductCategory | undefined
  options: FormOptions | null
  isLoading: boolean
  loadError: string | null
}

type LoadAction =
  | { type: 'loading' }
  | { type: 'succeeded'; category: ProductCategory | undefined; options: FormOptions }
  | { type: 'failed'; error: string }

const initialLoadState: LoadState = { category: undefined, options: null, isLoading: false, loadError: null }

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

export function useProductCategoryForm(categoryId: string | undefined) {
  const isEdit = !!categoryId
  const [loadState, dispatch] = useReducer(loadReducer, initialLoadState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      categoryId ? productCategoriesService.getProductCategoryDetail(categoryId) : Promise.resolve(undefined),
      productCategoriesService.getParentCategoryOptions(categoryId),
    ])
      .then(([category, parentCategoryOptions]) => {
        if (!cancelled) dispatch({ type: 'succeeded', category, options: { parentCategoryOptions } })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load product category form data.' })
      })

    return () => {
      cancelled = true
    }
  }, [categoryId])

  async function submit(values: ProductCategoryFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && categoryId) {
        await productCategoriesService.updateProductCategory(categoryId, values)
      } else {
        await productCategoriesService.createProductCategory(values)
      }
      return true
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save product category.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isEdit, ...loadState, isSubmitting, error: loadState.loadError ?? submitError, submit }
}
