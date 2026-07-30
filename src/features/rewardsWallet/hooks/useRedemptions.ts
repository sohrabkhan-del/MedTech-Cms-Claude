import { useGetRedemptionsQuery, useGetRedemptionKpisQuery } from '@/features/rewardsWallet/services/redemptionsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useRedemptions() {
  const redemptionsResult = useGetRedemptionsQuery()
  const kpisResult = useGetRedemptionKpisQuery()

  const isLoading = redemptionsResult.isLoading || kpisResult.isLoading
  const error = redemptionsResult.error
    ? getApiErrorMessage(redemptionsResult.error, 'Failed to load redemption requests.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load redemption requests.')
      : null

  return {
    redemptions: redemptionsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
