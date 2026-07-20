import { useEffect, useReducer } from 'react'
import { factoryUploadService } from '@/features/inventoryManagement/services/factoryUploadService'
import type { FactoryBatch, BatchContainer } from '@/features/inventoryManagement/types/inventoryManagement.types'

interface State {
  batch: FactoryBatch | undefined
  container: BatchContainer | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; batch: FactoryBatch | undefined; container: BatchContainer | undefined }
  | { type: 'failed'; error: string }

const initialState: State = { batch: undefined, container: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { batch: undefined, container: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { batch: action.batch, container: action.container, isLoading: false, error: null }
    case 'failed':
      return { batch: undefined, container: undefined, isLoading: false, error: action.error }
  }
}

export function useContainerDetail(batchId: string | undefined, containerId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!batchId || !containerId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      factoryUploadService.getFactoryBatchDetail(batchId),
      factoryUploadService.getContainerDetail(batchId, containerId),
    ])
      .then(([batch, container]) => {
        if (!cancelled) dispatch({ type: 'succeeded', batch, container })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load container.' })
      })

    return () => {
      cancelled = true
    }
  }, [batchId, containerId])

  return state
}
