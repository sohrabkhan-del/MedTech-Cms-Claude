import { useEffect, useReducer, useState } from 'react'
import { verificationService } from '@/features/userManagement/services/verificationService'
import type { ApprovalRequest, ApprovalStatus } from '@/features/userManagement/types/userManagement.types'

interface State {
  request: ApprovalRequest | undefined
  statusOverride: ApprovalStatus | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; request: ApprovalRequest | undefined }
  | { type: 'failed'; error: string }
  | { type: 'statusChanged'; status: ApprovalStatus }

const initialState: State = { request: undefined, statusOverride: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { request: undefined, statusOverride: null, isLoading: true, error: null }
    case 'succeeded':
      return { request: action.request, statusOverride: null, isLoading: false, error: null }
    case 'failed':
      return { request: undefined, statusOverride: null, isLoading: false, error: action.error }
    case 'statusChanged':
      return { ...state, statusOverride: action.status }
  }
}

export function useApprovalRequestDetail(requestId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isDeciding, setIsDeciding] = useState(false)

  useEffect(() => {
    if (!requestId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    verificationService
      .getApprovalRequestDetail(requestId)
      .then((request) => {
        if (!cancelled) dispatch({ type: 'succeeded', request })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load approval request.' })
      })

    return () => {
      cancelled = true
    }
  }, [requestId])

  async function decide(decision: 'approve' | 'reject', remarks?: string) {
    if (!requestId) return
    setIsDeciding(true)
    try {
      await verificationService.decideApprovalRequest(requestId, decision, remarks)
      dispatch({ type: 'statusChanged', status: decision === 'approve' ? 'approved' : 'rejected' })
    } finally {
      setIsDeciding(false)
    }
  }

  const request = state.request && state.statusOverride ? { ...state.request, status: state.statusOverride } : state.request

  return { ...state, request, decide, isDeciding }
}
