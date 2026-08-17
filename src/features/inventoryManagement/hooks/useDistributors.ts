import { useCallback } from 'react'
import {
  useGetDispatchInvoicesQuery,
  useConfirmImportMutation,
} from '@/features/inventoryManagement/services/distributorUploadApi'
import type { DispatchInvoiceMeta } from '@/features/inventoryManagement/dispatchReportParser'
import type { DispatchUploadRow } from '@/types/distributorUpload'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const ALL_INDIA_REGION = 'All India'

/** Dispatch invoices imported via Distributor Upload — starts pre-seeded, populated further once a batch has been confirmed. */
export function useDistributors() {
  const { region, regionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const effectiveRegionId = region === ALL_INDIA_REGION ? undefined : (regionId ?? undefined)

  const { data, isLoading, error: queryError } = useGetDispatchInvoicesQuery({
    ...analyticsParams,
    regionId: effectiveRegionId,
  })
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
