import { useCallback, useEffect, useReducer } from 'react'
import { factoryUploadService } from '@/features/inventoryManagement/services/factoryUploadService'
import type { FactoryBatch } from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { factoryUploadKpis } from '@/features/inventoryManagement/mockFactoryUploads'
import type { BmrBatchRow } from '@/types/batchUidUpload'

type FactoryUploadKpis = typeof factoryUploadKpis

interface State {
  batches: FactoryBatch[]
  kpis: FactoryUploadKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; batches: FactoryBatch[]; kpis: FactoryUploadKpis }
  | { type: 'failed'; error: string }

const initialState: State = {
  batches: [],
  kpis: null,
  isLoading: false,
  error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return {
        batches: action.batches,
        kpis: action.kpis,
        isLoading: false,
        error: null,
      }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useFactoryUploads() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const load = useCallback(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      factoryUploadService.getFactoryBatches(),
      factoryUploadService.getFactoryUploadKpis(),
    ])
      .then(([batches, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', batches, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled)
          dispatch({
            type: 'failed',
            error: err.message ?? 'Failed to load factory uploads.',
          })
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => load(), [load])

  const importBmrUpload = useCallback(
    async (
      batchRows: BmrBatchRow[],
      uploadFileName: string,
      containerCountByBatch: Record<string, number>,
    ) => {
      await factoryUploadService.importBmrUpload(
        batchRows,
        uploadFileName,
        containerCountByBatch,
      )
      load()
    },
    [load],
  )

  return { ...state, importBmrUpload }
}
