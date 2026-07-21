import { useEffect, useReducer } from 'react'
import { giftsService } from '@/features/schemeManagement/services/giftsService'
import type { Gift } from '@/features/schemeManagement/types/schemeManagement.types'
import type { giftCatalogueKpis } from '@/features/schemeManagement/mockGifts'

type GiftCatalogueKpis = typeof giftCatalogueKpis

interface State {
  gifts: Gift[]
  kpis: GiftCatalogueKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; gifts: Gift[]; kpis: GiftCatalogueKpis }
  | { type: 'failed'; error: string }

const initialState: State = { gifts: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { gifts: action.gifts, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useGifts() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([giftsService.getGifts(), giftsService.getGiftCatalogueKpis()])
      .then(([gifts, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', gifts, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load gifts.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
