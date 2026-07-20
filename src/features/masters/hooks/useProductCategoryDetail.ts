import { useEffect, useReducer } from 'react'
import { productCategoriesService } from '@/features/masters/services/productCategoriesService'
import type { ProductCategory } from '@/features/masters/types/masters.types'

interface State {
  category: ProductCategory | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; category: ProductCategory | undefined }
  | { type: 'failed'; error: string }

const initialState: State = { category: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { category: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { category: action.category, isLoading: false, error: null }
    case 'failed':
      return { category: undefined, isLoading: false, error: action.error }
  }
}

export function useProductCategoryDetail(categoryId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!categoryId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    productCategoriesService
      .getProductCategoryDetail(categoryId)
      .then((category) => {
        if (!cancelled) dispatch({ type: 'succeeded', category })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load product category.' })
      })

    return () => {
      cancelled = true
    }
  }, [categoryId])

  return state
}
