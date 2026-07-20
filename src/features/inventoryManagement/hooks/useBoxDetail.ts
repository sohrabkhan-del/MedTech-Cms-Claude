import { useEffect, useReducer } from 'react'
import { factoryUploadService } from '@/features/inventoryManagement/services/factoryUploadService'
import type { FactoryBatch, BatchContainer, ContainerBox } from '@/features/inventoryManagement/types/inventoryManagement.types'

interface State {
  batch: FactoryBatch | undefined
  container: BatchContainer | undefined
  box: ContainerBox | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; batch: FactoryBatch | undefined; container: BatchContainer | undefined; box: ContainerBox | undefined }
  | { type: 'failed'; error: string }

const initialState: State = { batch: undefined, container: undefined, box: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { batch: undefined, container: undefined, box: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { ...action, isLoading: false, error: null }
    case 'failed':
      return { batch: undefined, container: undefined, box: undefined, isLoading: false, error: action.error }
  }
}

export function useBoxDetail(batchId: string | undefined, containerId: string | undefined, boxId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!batchId || !containerId || !boxId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      factoryUploadService.getFactoryBatchDetail(batchId),
      factoryUploadService.getContainerDetail(batchId, containerId),
      factoryUploadService.getBoxDetail(batchId, containerId, boxId),
    ])
      .then(([batch, container, box]) => {
        if (!cancelled) dispatch({ type: 'succeeded', batch, container, box })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load box.' })
      })

    return () => {
      cancelled = true
    }
  }, [batchId, containerId, boxId])

  return state
}
