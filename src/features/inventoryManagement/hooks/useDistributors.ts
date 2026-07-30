import { useCallback } from 'react'
import {
  useGetDispatchInvoicesQuery,
  useConfirmImportMutation,
} from '@/features/inventoryManagement/services/distributorUploadApi'
import type { DispatchInvoiceMeta } from '@/features/inventoryManagement/dispatchReportParser'
import type { DispatchUploadRow } from '@/types/distributorUpload'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Dispatch invoices imported via Distributor Upload — starts pre-seeded, populated further once a batch has been confirmed. */
export function useDistributors() {
  const { data, isLoading, error: queryError } = useGetDispatchInvoicesQuery()
  const [confirmImportMutation] = useConfirmImportMutation()

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load dispatch invoices.') : null

  const importDispatch = useCallback(
    async (rows: DispatchUploadRow[], uploadFileName: string, invoiceMeta: DispatchInvoiceMeta) => {
      await confirmImportMutation({ rows, uploadFileName, invoiceMeta }).unwrap()
    },
    [confirmImportMutation],
  )

  return { invoices: data ?? [], isLoading, error, importDispatch }
}
