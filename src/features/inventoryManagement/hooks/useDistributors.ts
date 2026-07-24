import { useCallback, useEffect, useReducer } from 'react'
import { distributorUploadService } from '@/features/inventoryManagement/services/distributorUploadService'
import type { DispatchInvoiceMeta } from '@/features/inventoryManagement/dispatchReportParser'
import type { DispatchInvoice, DispatchUploadRow } from '@/types/distributorUpload'

interface State {
  invoices: DispatchInvoice[]
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'succeeded'; invoices: DispatchInvoice[] }
  | { type: 'failed'; error: string }

const initialState: State = { invoices: [], isLoading: false, error: null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'succeeded':
      return { invoices: action.invoices, isLoading: false, error: null }
    case 'failed':
      return { ...state, isLoading: false, error: action.error }
  }
}

/** Dispatch invoices imported via Distributor Upload — starts pre-seeded, populated further once a batch has been confirmed. */
export function useDistributors() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const load = useCallback(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    distributorUploadService
      .getDispatchInvoices()
      .then((invoices) => {
        if (!cancelled) dispatch({ type: 'succeeded', invoices })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load dispatch invoices.' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => load(), [load])

  const importDispatch = useCallback(
    async (
      rows: DispatchUploadRow[],
      uploadFileName: string,
      invoiceMeta: DispatchInvoiceMeta,
    ) => {
      await distributorUploadService.confirmImport(rows, uploadFileName, invoiceMeta)
      load()
    },
    [load],
  )

  return { ...state, importDispatch }
}
