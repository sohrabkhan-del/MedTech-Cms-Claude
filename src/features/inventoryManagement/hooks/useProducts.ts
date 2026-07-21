import { useEffect, useReducer } from 'react'
import { productsService } from '@/features/inventoryManagement/services/productsService'
import type { Product } from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { productKpis } from '@/features/inventoryManagement/mockProducts'

type ProductKpis = typeof productKpis

interface State {
  products: Product[]
  kpis: ProductKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; products: Product[]; kpis: ProductKpis }
  | { type: 'failed'; error: string }

const initialState: State = { products: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { products: action.products, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useProducts() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([productsService.getProducts(), productsService.getProductKpis()])
      .then(([products, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', products, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load products.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
