import { useGetWalletsQuery, useGetWalletKpisQuery } from '@/features/rewardsWallet/services/walletsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useWallets() {
  const walletsResult = useGetWalletsQuery()
  const kpisResult = useGetWalletKpisQuery()

  const isLoading = walletsResult.isLoading || kpisResult.isLoading
  const error = walletsResult.error
    ? getApiErrorMessage(walletsResult.error, 'Failed to load wallets.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load wallets.')
      : null

  return {
    wallets: walletsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
