import { useEffect, useReducer } from 'react'
import { distributorUploadService } from '@/features/inventoryManagement/services/distributorUploadService'
import type { DistributorRecord } from '@/types/distributorUpload'

interface State {
  distributor: DistributorRecord | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; distributor: DistributorRecord | undefined }
  | { type: 'failed'; error: string }

const initialState: State = {
  distributor: undefined,
  isLoading: false,
  error: null,
}

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { distributor: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { distributor: action.distributor, isLoading: false, error: null }
    case 'failed':
      return { distributor: undefined, isLoading: false, error: action.error }
  }
}

export function useDistributorDetail(distributorId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!distributorId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    distributorUploadService
      .getDistributorDetail(distributorId)
      .then((distributor) => {
        if (!cancelled) dispatch({ type: 'succeeded', distributor })
      })
      .catch((err: Error) => {
        if (!cancelled)
          dispatch({
            type: 'failed',
            error: err.message ?? 'Failed to load distributor.',
          })
      })

    return () => {
      cancelled = true
    }
  }, [distributorId])

  return state
}
