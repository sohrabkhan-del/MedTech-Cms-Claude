import { useEffect, useReducer, useState } from 'react'
import { verificationService } from '@/features/userManagement/services/verificationService'
import type { ApprovalRequest } from '@/features/userManagement/types/userManagement.types'
import type { rejectedRequestKpis } from '@/features/verification/mockApprovalRequests'

type RejectedRequestKpis = typeof rejectedRequestKpis

interface State {
  requests: ApprovalRequest[]
  kpis: RejectedRequestKpis | null
  reviewers: string[]
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; requests: ApprovalRequest[]; kpis: RejectedRequestKpis; reviewers: string[] }
  | { type: 'failed'; error: string }

const initialState: State = { requests: [], kpis: null, reviewers: [], isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { requests: [], kpis: null, reviewers: [], isLoading: true, error: null }
    case 'succeeded':
      return { ...action, isLoading: false, error: null }
    case 'failed':
      return { requests: [], kpis: null, reviewers: [], isLoading: false, error: action.error }
  }
}

export function useRejectedRequests() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [reopenedIds, setReopenedIds] = useState<Set<string>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      verificationService.getApprovalRequests('rejected'),
      verificationService.getRejectedRequestKpis(),
      verificationService.getRejectedReviewers(),
    ])
      .then(([requests, kpis, reviewers]) => {
        if (!cancelled) dispatch({ type: 'succeeded', requests, kpis, reviewers })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load rejected requests.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function reopen(id: string) {
    await verificationService.reopenRequest(id)
    setReopenedIds((prev) => new Set(prev).add(id))
  }

  async function remove(id: string) {
    await verificationService.deleteRequest(id)
    setDeletedIds((prev) => new Set(prev).add(id))
  }

  const requests = state.requests.filter((r) => !reopenedIds.has(r.id) && !deletedIds.has(r.id))

  return { ...state, requests, reopen, remove }
}
