import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetUserSecurityProfileQuery,
  useSetUserStatusMutation,
} from '@/features/fieldOperations/services/securityAlertsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useSecurityAlertUserProfile(userId: string | undefined) {
  const { data, isLoading, error: queryError } = useGetUserSecurityProfileQuery(userId ?? skipToken)
  const [setUserStatusMutation] = useSetUserStatusMutation()

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load user security profile.') : null

  async function setStatus(status: 'active' | 'inactive') {
    if (!userId) return
    await setUserStatusMutation({ userId, status }).unwrap()
  }

  return {
    summary: data?.summary,
    alertHistory: data?.alertHistory ?? [],
    timeline: data?.timeline ?? [],
    currentStatus: data?.summary?.status,
    isLoading,
    error,
    setStatus,
  }
}
