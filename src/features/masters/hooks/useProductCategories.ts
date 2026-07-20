import { useEffect, useReducer } from 'react'
import { productCategoriesService } from '@/features/masters/services/productCategoriesService'
import type { ProductCategory } from '@/features/masters/types/masters.types'
import type { productCategoryKpis } from '@/features/masters/mockProductCategories'

type ProductCategoryKpis = typeof productCategoryKpis

interface State {
  categories: ProductCategory[]
  kpis: ProductCategoryKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; categories: ProductCategory[]; kpis: ProductCategoryKpis }
  | { type: 'failed'; error: string }

const initialState: State = { categories: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { categories: action.categories, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useProductCategories() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([productCategoriesService.getProductCategories(), productCategoriesService.getProductCategoryKpis()])
      .then(([categories, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', categories, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load product categories.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
