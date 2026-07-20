import { useEffect, useReducer } from 'react'
import { productBatchesService } from '@/features/inventoryManagement/services/productBatchesService'
import type { ProductionBatch } from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { productionBatchKpis } from '@/features/inventory/mockProductBatches'

type ProductionBatchKpis = typeof productionBatchKpis

interface State {
  batches: ProductionBatch[]
  kpis: ProductionBatchKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; batches: ProductionBatch[]; kpis: ProductionBatchKpis }
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

/** Production batches (the "Batch Listing" tab) — see useFactoryUploads for factory-upload batches. */
export function useProductBatches() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([productBatchesService.getProductionBatches(), productBatchesService.getProductionBatchKpis()])
      .then(([batches, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', batches, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load product batches.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
