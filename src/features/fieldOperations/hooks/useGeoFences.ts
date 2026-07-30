import { useGetGeoFencesQuery, useGetGeoFenceKpisQuery } from '@/features/fieldOperations/services/geoFencesApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useGeoFences() {
  const geoFencesResult = useGetGeoFencesQuery()
  const kpisResult = useGetGeoFenceKpisQuery()

  const isLoading = geoFencesResult.isLoading || kpisResult.isLoading
  const error = geoFencesResult.error
    ? getApiErrorMessage(geoFencesResult.error, 'Failed to load geo fences.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load geo fences.')
      : null

  return {
    geoFences: geoFencesResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
