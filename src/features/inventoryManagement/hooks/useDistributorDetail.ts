import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetDispatchInvoiceDetailQuery } from '@/features/inventoryManagement/services/distributorUploadApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useDistributorDetail(invoiceId: string | undefined) {
  const { data: invoice, isLoading, error: queryError } = useGetDispatchInvoiceDetailQuery(invoiceId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load dispatch invoice.') : null

  return { invoice, isLoading, error }
}
