import { useEffect, useReducer } from 'react'
import { interestedUsersService } from '@/features/marketingProducts/services/interestedUsersService'
import type { InterestedUserLead, LeadStatus } from '@/features/marketingProducts/types/marketingProducts.types'

interface State {
  lead: InterestedUserLead | undefined
  statusOverride: LeadStatus | null
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; lead: InterestedUserLead | undefined }
  | { type: 'failed'; error: string }
  | { type: 'statusChanged'; status: LeadStatus }

const initialState: State = { lead: undefined, statusOverride: null, isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { lead: undefined, statusOverride: null, isLoading: true, error: null }
    case 'succeeded':
      return { lead: action.lead, statusOverride: null, isLoading: false, error: null }
    case 'failed':
      return { lead: undefined, statusOverride: null, isLoading: false, error: action.error }
    case 'statusChanged':
      return { ...state, statusOverride: action.status }
  }
}

export function useInterestedUserDetail(leadId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!leadId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    interestedUsersService
      .getInterestedUserDetail(leadId)
      .then((lead) => {
        if (!cancelled) dispatch({ type: 'succeeded', lead })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load lead.' })
      })

    return () => {
      cancelled = true
    }
  }, [leadId])

  async function setStatus(status: LeadStatus) {
    if (!leadId) return
    await interestedUsersService.setLeadStatus(leadId, status)
    dispatch({ type: 'statusChanged', status })
  }

  async function remove() {
    if (!leadId) return
    await interestedUsersService.deleteLead(leadId)
  }

  const lead = state.lead && state.statusOverride ? { ...state.lead, leadStatus: state.statusOverride } : state.lead

  return { ...state, lead, setStatus, remove }
}
