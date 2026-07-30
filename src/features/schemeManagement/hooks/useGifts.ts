import { useGetGiftsQuery, useGetGiftCatalogueKpisQuery } from '@/features/schemeManagement/services/giftsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useGifts() {
  const giftsResult = useGetGiftsQuery()
  const kpisResult = useGetGiftCatalogueKpisQuery()

  const isLoading = giftsResult.isLoading || kpisResult.isLoading
  const error = giftsResult.error
    ? getApiErrorMessage(giftsResult.error, 'Failed to load gifts.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load gifts.')
      : null

  return {
    gifts: giftsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
