import { useEffect, useReducer } from 'react'
import { productsService } from '@/features/inventoryManagement/services/productsService'
import type { Product } from '@/features/inventoryManagement/types/inventoryManagement.types'

interface State {
  product: Product | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; product: Product | undefined }
  | { type: 'failed'; error: string }

const initialState: State = { product: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { product: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { product: action.product, isLoading: false, error: null }
    case 'failed':
      return { product: undefined, isLoading: false, error: action.error }
  }
}

export function useProductDetail(productId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!productId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    productsService
      .getProductDetail(productId)
      .then((product) => {
        if (!cancelled) dispatch({ type: 'succeeded', product })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load product.' })
      })

    return () => {
      cancelled = true
    }
  }, [productId])

  return state
}
