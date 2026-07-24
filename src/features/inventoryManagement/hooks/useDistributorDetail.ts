import { useEffect, useReducer } from 'react'
import { distributorUploadService } from '@/features/inventoryManagement/services/distributorUploadService'
import type { DispatchInvoice } from '@/types/distributorUpload'

interface State {
  invoice: DispatchInvoice | undefined
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; invoice: DispatchInvoice | undefined }
  | { type: 'failed'; error: string }

const initialState: State = {
  invoice: undefined,
  isLoading: false,
  error: null,
}

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { invoice: undefined, isLoading: true, error: null }
    case 'succeeded':
      return { invoice: action.invoice, isLoading: false, error: null }
    case 'failed':
      return { invoice: undefined, isLoading: false, error: action.error }
  }
}

export function useDistributorDetail(invoiceId: string | undefined) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!invoiceId) return

    let cancelled = false
    dispatch({ type: 'loading' })

    distributorUploadService
      .getDispatchInvoiceDetail(invoiceId)
      .then((invoice) => {
        if (!cancelled) dispatch({ type: 'succeeded', invoice })
      })
      .catch((err: Error) => {
        if (!cancelled)
          dispatch({
            type: 'failed',
            error: err.message ?? 'Failed to load dispatch invoice.',
          })
      })

    return () => {
      cancelled = true
    }
  }, [invoiceId])

  return state
}
