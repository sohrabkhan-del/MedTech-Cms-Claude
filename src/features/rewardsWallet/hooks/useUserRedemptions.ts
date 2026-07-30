import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetRedemptionsByUserIdQuery } from '@/features/rewardsWallet/services/redemptionsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useUserRedemptions(userId: string | undefined) {
  const { data, isLoading, error: queryError } = useGetRedemptionsByUserIdQuery(userId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load redemption history.') : null

  return {
    redemptions: data ?? [],
    isLoading,
    error,
  }
}
