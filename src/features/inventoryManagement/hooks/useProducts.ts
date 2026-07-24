import { useCallback, useEffect, useReducer } from 'react'
import { productsService } from '@/features/inventoryManagement/services/productsService'
import type { Product } from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { productKpis } from '@/features/inventoryManagement/mockProducts'
import type { ParsedImportFile } from '@/components/common/CommonTable/tableCsv'

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
  | { type: 'imported'; products: Product[] }

const initialState: State = { products: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { products: action.products, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
    case 'imported': {
      const products = [...action.products, ...state.products]
      const kpis = state.kpis && {
        ...state.kpis,
        totalProducts: state.kpis.totalProducts + action.products.length,
        activeProducts: state.kpis.activeProducts + action.products.length,
      }
      return { ...state, products, kpis }
    }
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

  const importProducts = useCallback(async (parsed: ParsedImportFile) => {
    const products = await productsService.importProducts(parsed)
    dispatch({ type: 'imported', products })
  }, [])

  return { ...state, importProducts }
}
