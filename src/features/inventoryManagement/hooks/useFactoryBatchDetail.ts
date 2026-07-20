import { useEffect, useReducer } from 'react'
import { factoryUploadService } from '@/features/inventoryManagement/services/factoryUploadService'
import type { FactoryBatch } from '@/features/inventoryManagement/types/inventoryManagement.types'

interface State {
  batch: FactoryBatch | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; batch: FactoryBatch | undefined }
  | { type: 'failed'; error: string }

const initialState: State = { batch: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { batch: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { batch: action.batch, isLoading: false, error: null }
    case 'failed':
      return { batch: undefined, isLoading: false, error: action.error }
  }
}

export function useFactoryBatchDetail(batchId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!batchId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    factoryUploadService
      .getFactoryBatchDetail(batchId)
      .then((batch) => {
        if (!cancelled) dispatch({ type: 'succeeded', batch })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load factory batch.' })
      })

    return () => {
      cancelled = true
    }
  }, [batchId])

  return state
}
