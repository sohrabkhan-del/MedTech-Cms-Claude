import { useEffect, useReducer } from 'react'
import { scanFeedService } from '@/features/fieldOperations/services/scanFeedService'
import type { ScanEvent } from '@/features/fieldOperations/types/fieldOperations.types'

interface State {
  scanEvent: ScanEvent | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; scanEvent: ScanEvent | undefined }
  | { type: 'failed'; error: string }

const initialState: State = { scanEvent: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { scanEvent: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { scanEvent: action.scanEvent, isLoading: false, error: null }
    case 'failed':
      return { scanEvent: undefined, isLoading: false, error: action.error }
  }
}

export function useScanEventDetail(scanId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!scanId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    scanFeedService
      .getScanEventDetail(scanId)
      .then((scanEvent) => {
        if (!cancelled) dispatch({ type: 'succeeded', scanEvent })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load scan event.' })
      })

    return () => {
      cancelled = true
    }
  }, [scanId])

  return state
}
