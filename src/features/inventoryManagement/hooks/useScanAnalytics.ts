import { useEffect, useReducer } from 'react'
import { productBatchesService } from '@/features/inventoryManagement/services/productBatchesService'
import type { ScanAnalyticsRow } from '@/features/inventoryManagement/types/inventoryManagement.types'

interface State {
  rows: ScanAnalyticsRow[]
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; rows: ScanAnalyticsRow[] }
  | { type: 'failed'; error: string }

const initialState: State = { rows: [], isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { rows: action.rows, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useScanAnalytics() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    productBatchesService
      .getScanAnalyticsRows()
      .then((rows) => {
        if (!cancelled) dispatch({ type: 'succeeded', rows })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load scan analytics.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
