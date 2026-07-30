import {
  useGetMasterScanLogsQuery,
  useGetMasterScanLogKpisQuery,
  useGetMasterScanLogFilterOptionsQuery,
} from '@/features/audit/services/masterScanLogsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useMasterScanLogs() {
  const logsResult = useGetMasterScanLogsQuery()
  const kpisResult = useGetMasterScanLogKpisQuery()
  const filterOptionsResult = useGetMasterScanLogFilterOptionsQuery()

  const isLoading = logsResult.isLoading || kpisResult.isLoading || filterOptionsResult.isLoading

  const error = logsResult.error
    ? getApiErrorMessage(logsResult.error, 'Failed to load master scan logs.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load master scan logs.')
      : filterOptionsResult.error
        ? getApiErrorMessage(filterOptionsResult.error, 'Failed to load master scan logs.')
        : null

  return {
    logs: logsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    filterOptions: filterOptionsResult.data ?? null,
    isLoading,
    error,
  }
}
