import { useEffect, useReducer } from 'react'
import { giftsService } from '@/features/schemeManagement/services/giftsService'
import type { Gift, GiftStatus } from '@/features/schemeManagement/types/schemeManagement.types'

interface State {
  gift: Gift | undefined
  statusOverride: GiftStatus | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; gift: Gift | undefined }
  | { type: 'failed'; error: string }
  | { type: 'statusChanged'; status: GiftStatus }

const initialState: State = { gift: undefined, statusOverride: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { gift: undefined, statusOverride: null, isLoading: true, error: null }
    case 'succeeded':
      return { gift: action.gift, statusOverride: null, isLoading: false, error: null }
    case 'failed':
      return { gift: undefined, statusOverride: null, isLoading: false, error: action.error }
    case 'statusChanged':
      return { ...state, statusOverride: action.status }
  }
}

export function useGiftDetail(giftId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!giftId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    giftsService
      .getGiftDetail(giftId)
      .then((gift) => {
        if (!cancelled) dispatch({ type: 'succeeded', gift })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load gift.' })
      })

    return () => {
      cancelled = true
    }
  }, [giftId])

  async function setStatus(status: GiftStatus) {
    if (!giftId) return
    await giftsService.setGiftStatus(giftId, status)
    dispatch({ type: 'statusChanged', status })
  }

  async function remove() {
    if (!giftId) return
    await giftsService.deleteGift(giftId)
  }

  const gift = state.gift && state.statusOverride ? { ...state.gift, status: state.statusOverride } : state.gift

  return { ...state, gift, setStatus, remove }
}
