import { useEffect, useReducer } from 'react'
import { scanFeedService } from '@/features/fieldOperations/services/scanFeedService'
import type { ScanUserSummary, ScanEvent } from '@/features/fieldOperations/types/fieldOperations.types'

interface State {
  summary: ScanUserSummary | undefined
  history: ScanEvent[]
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; summary: ScanUserSummary | undefined; history: ScanEvent[] }
  | { type: 'failed'; error: string }

const initialState: State = { summary: undefined, history: [], isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { summary: undefined, history: [], isLoading: true, error: null }
    case 'succeeded':
      return { summary: action.summary, history: action.history, isLoading: false, error: null }
    case 'failed':
      return { summary: undefined, history: [], isLoading: false, error: action.error }
  }
}

export function useScanUserProfile(userId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    scanFeedService
      .getUserScanProfile(userId)
      .then(({ summary, history }) => {
        if (!cancelled) dispatch({ type: 'succeeded', summary, history })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load user scan profile.' })
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  return state
}
