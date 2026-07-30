import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetUserScanProfileQuery } from '@/features/fieldOperations/services/scanFeedApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useScanUserProfile(userId: string | undefined) {
  const { data, isLoading, error: queryError } = useGetUserScanProfileQuery(userId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load user scan profile.') : null

  return {
    summary: data?.summary,
    history: data?.history ?? [],
    isLoading,
    error,
  }
}
