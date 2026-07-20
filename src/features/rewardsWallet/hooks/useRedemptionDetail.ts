import { useEffect, useReducer } from 'react'
import { redemptionsService } from '@/features/rewardsWallet/services/redemptionsService'
import type { RedemptionRequest, RedemptionStatus, RedemptionDeliveryStatus } from '@/features/rewardsWallet/types/rewardsWallet.types'

interface State {
  request: RedemptionRequest | undefined
  statusOverride: RedemptionStatus | null
  deliveryOverride: RedemptionDeliveryStatus | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; request: RedemptionRequest | undefined }
  | { type: 'failed'; error: string }
  | { type: 'statusChanged'; status: RedemptionStatus }
  | { type: 'deliveryChanged'; status: RedemptionDeliveryStatus }
  | { type: 'deliveredChanged'; status: RedemptionDeliveryStatus; redemptionStatus: RedemptionStatus }

const initialState: State = { request: undefined, statusOverride: null, deliveryOverride: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { request: undefined, statusOverride: null, deliveryOverride: null, isLoading: true, error: null }
    case 'succeeded':
      return { request: action.request, statusOverride: null, deliveryOverride: null, isLoading: false, error: null }
    case 'failed':
      return { request: undefined, statusOverride: null, deliveryOverride: null, isLoading: false, error: action.error }
    case 'statusChanged':
      return { ...state, statusOverride: action.status }
    case 'deliveryChanged':
      return { ...state, deliveryOverride: action.status }
    case 'deliveredChanged':
      return { ...state, deliveryOverride: action.status, statusOverride: action.redemptionStatus }
  }
}

export function useRedemptionDetail(requestId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!requestId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    redemptionsService
      .getRedemptionDetail(requestId)
      .then((request) => {
        if (!cancelled) dispatch({ type: 'succeeded', request })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load redemption request.' })
      })

    return () => {
      cancelled = true
    }
  }, [requestId])

  async function setStatus(status: RedemptionStatus) {
    if (!requestId) return
    await redemptionsService.setRedemptionStatus(requestId, status)
    dispatch({ type: 'statusChanged', status })
  }

  async function setDeliveryStatus(status: RedemptionDeliveryStatus) {
    if (!requestId) return
    await redemptionsService.setDeliveryStatus(requestId, status)
    if (status === 'delivered') {
      await redemptionsService.setRedemptionStatus(requestId, 'completed')
      dispatch({ type: 'deliveredChanged', status, redemptionStatus: 'completed' })
      return
    }
    dispatch({ type: 'deliveryChanged', status })
  }

  const request =
    state.request && (state.statusOverride || state.deliveryOverride)
      ? {
          ...state.request,
          redemptionStatus: state.statusOverride ?? state.request.redemptionStatus,
          deliveryStatus: state.deliveryOverride ?? state.request.deliveryStatus,
        }
      : state.request

  return { ...state, request, setStatus, setDeliveryStatus }
}
