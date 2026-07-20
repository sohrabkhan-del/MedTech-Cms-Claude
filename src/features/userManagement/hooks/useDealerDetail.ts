import { useEffect, useReducer } from 'react'
import { partnersService } from '@/features/userManagement/services/partnersService'
import type { Dealer } from '@/features/userManagement/types/userManagement.types'

interface State {
  dealer: Dealer | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; dealer: Dealer | undefined }
  | { type: 'failed'; error: string }

const initialState: State = { dealer: undefined, isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { dealer: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { dealer: action.dealer, isLoading: false, error: null }
    case 'failed':
      return { dealer: undefined, isLoading: false, error: action.error }
  }
}

export function useDealerDetail(dealerId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!dealerId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    partnersService
      .getDealerDetail(dealerId)
      .then((dealer) => {
        if (!cancelled) dispatch({ type: 'succeeded', dealer })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load dealer.' })
      })

    return () => {
      cancelled = true
    }
  }, [dealerId])

  return state
}
