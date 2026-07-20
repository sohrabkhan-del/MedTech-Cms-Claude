import { useEffect, useReducer, useState } from 'react'
import { verificationService } from '@/features/userManagement/services/verificationService'
import type { ApprovalRequest, ApprovalStatus } from '@/features/userManagement/types/userManagement.types'
import type { approvalRequestKpis } from '@/features/verification/mockApprovalRequests'

type ApprovalRequestKpis = typeof approvalRequestKpis

interface State {
  requests: ApprovalRequest[]
  kpis: ApprovalRequestKpis | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; requests: ApprovalRequest[]; kpis: ApprovalRequestKpis }
  | { type: 'failed'; error: string }

const initialState: State = { requests: [], kpis: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { requests: action.requests, kpis: action.kpis, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

export function useApprovalRequests() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ApprovalStatus>>({})

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([verificationService.getApprovalRequests(), verificationService.getApprovalRequestKpis()])
      .then(([requests, kpis]) => {
        if (!cancelled) dispatch({ type: 'succeeded', requests, kpis })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load approval requests.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function decide(id: string, decision: 'approve' | 'reject', remarks?: string) {
    await verificationService.decideApprovalRequest(id, decision, remarks)
    setStatusOverrides((prev) => ({ ...prev, [id]: decision === 'approve' ? 'approved' : 'rejected' }))
  }

  const requests = state.requests.map((request) => ({
    ...request,
    status: statusOverrides[request.id] ?? request.status,
  }))

  return { ...state, requests, decide }
}
