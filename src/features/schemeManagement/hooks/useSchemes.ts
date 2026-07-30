import { useGetAllSchemesQuery, useGetAllSchemeKpisQuery } from '@/features/schemeManagement/services/schemesApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useSchemes() {
  const schemesResult = useGetAllSchemesQuery()
  const kpisResult = useGetAllSchemeKpisQuery()

  const isLoading = schemesResult.isLoading || kpisResult.isLoading
  const error = schemesResult.error
    ? getApiErrorMessage(schemesResult.error, 'Failed to load schemes.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load schemes.')
      : null

  function refetch() {
    schemesResult.refetch()
    kpisResult.refetch()
  }

  return {
    schemes: schemesResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
    refetch,
  }
}
