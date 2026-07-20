import { useEffect, useReducer } from 'react'
import { productBatchesService } from '@/features/inventoryManagement/services/productBatchesService'
import type { ProductBatch } from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { productBatchKpis } from '@/features/inventory/mockProductBatches'

type ProductBatchKpis = typeof productBatchKpis

interface State {
  batches: ProductBatch[]
  kpis: ProductBatchKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; batches: ProductBatch[]; kpis: ProductBatchKpis }
  | { type: 'failed'; error: string }

const initialState: State = { batches: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { batches: action.batches, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

/** Backs the "Scanning Products" tab on the Product Batches page. */
export function useScanningProducts() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([productBatchesService.getProductBatches(), productBatchesService.getProductBatchKpis()])
      .then(([batches, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', batches, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load scanning products.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
