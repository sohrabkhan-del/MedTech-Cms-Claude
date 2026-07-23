import { useCallback, useEffect, useReducer } from 'react'
import { distributorUploadService } from '@/features/inventoryManagement/services/distributorUploadService'
import type { DistributorRecord, DistributorUploadRow } from '@/types/distributorUpload'

interface State {
  distributors: DistributorRecord[]
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; distributors: DistributorRecord[] }
  | { type: 'failed'; error: string }

const initialState: State = { distributors: [], isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { distributors: action.distributors, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

/** Imported distributors — starts empty, populated once a Distributor Upload has been confirmed. */
export function useDistributors() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const load = useCallback(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    distributorUploadService
      .getDistributors()
      .then((distributors) => {
        if (!cancelled) dispatch({ type: 'succeeded', distributors })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load distributors.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => load(), [load])

  const importDistributors = useCallback(
    async (rows: DistributorUploadRow[], uploadFileName: string) => {
      await distributorUploadService.confirmImport(rows, uploadFileName)
      load()
    },
    [load],
  )

  return { ...state, importDistributors }
}
