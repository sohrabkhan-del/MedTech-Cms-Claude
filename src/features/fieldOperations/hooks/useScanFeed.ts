import { useEffect, useReducer } from 'react'
import { scanFeedService } from '@/features/fieldOperations/services/scanFeedService'
import type { ScanEvent } from '@/features/fieldOperations/types/fieldOperations.types'
import type { scanFeedKpis } from '@/features/fieldOperations/mocks/mockScanFeed'

type ScanFeedKpis = typeof scanFeedKpis

interface State {
  scanEvents: ScanEvent[]
  kpis: ScanFeedKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; scanEvents: ScanEvent[]; kpis: ScanFeedKpis }
  | { type: 'failed'; error: string }

const initialState: State = { scanEvents: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { scanEvents: action.scanEvents, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

/** Initial scan-feed page + KPIs. See useLiveScanFeed for the real-time-updating variant. */
export function useScanFeed() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([scanFeedService.getScanEvents(), scanFeedService.getScanFeedKpis()])
      .then(([scanEvents, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', scanEvents, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load scan feed.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
