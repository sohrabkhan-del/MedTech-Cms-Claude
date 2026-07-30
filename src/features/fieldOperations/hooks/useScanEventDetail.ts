import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetScanEventDetailQuery } from '@/features/fieldOperations/services/scanFeedApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useScanEventDetail(scanId: string | undefined) {
  const { data: scanEvent, isLoading, error: queryError } = useGetScanEventDetailQuery(scanId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load scan event.') : null

  return { scanEvent, isLoading, error }
}
