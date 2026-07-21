import { useEffect, useReducer, useState } from 'react'
import { interestedUsersService } from '@/features/marketingProducts/services/interestedUsersService'
import type { InterestedUserLead, LeadStatus } from '@/features/marketingProducts/types/marketingProducts.types'
import type { interestedUserKpis } from '@/features/marketingProducts/mockInterestedUsers'

type InterestedUserKpis = typeof interestedUserKpis

interface State {
  leads: InterestedUserLead[]
  kpis: InterestedUserKpis | null
  handlerOptions: string[]
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; leads: InterestedUserLead[]; kpis: InterestedUserKpis; handlerOptions: string[] }
  | { type: 'failed'; error: string }

const initialState: State = { leads: [], kpis: null, handlerOptions: [], isLoading: false, error: null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { leads: [], kpis: null, handlerOptions: [], isLoading: true, error: null }
    case 'succeeded':
      return { ...action, isLoading: false, error: null }
    case 'failed':
      return { leads: [], kpis: null, handlerOptions: [], isLoading: false, error: action.error }
  }
}

export function useInterestedUsers() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, LeadStatus>>({})
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      interestedUsersService.getInterestedUsers(),
      interestedUsersService.getInterestedUserKpis(),
      interestedUsersService.getHandlerOptions(),
    ])
      .then(([leads, kpis, handlerOptions]) => {
        if (!cancelled) dispatch({ type: 'succeeded', leads, kpis, handlerOptions })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load interested users.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function setStatus(id: string, status: LeadStatus) {
    await interestedUsersService.setLeadStatus(id, status)
    setStatusOverrides((prev) => ({ ...prev, [id]: status }))
  }

  async function remove(id: string) {
    await interestedUsersService.deleteLead(id)
    setDeletedIds((prev) => new Set(prev).add(id))
  }

  const leads = state.leads
    .filter((lead) => !deletedIds.has(lead.id))
    .map((lead) => ({ ...lead, leadStatus: statusOverrides[lead.id] ?? lead.leadStatus }))

  return { ...state, leads, setStatus, remove }
}
