import {
  useGetAllSchemesQuery,
  useGetAllSchemeKpisQuery,
  type SchemeQueryParams,
} from '@/features/schemeManagement/services/schemesApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const ALL_INDIA_REGION = 'All India'

export function useSchemes(
  paramsOverride?: Pick<SchemeQueryParams, 'search' | 'schemeType'>,
) {
  const { region, regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const effectiveRegionId =
    region === ALL_INDIA_REGION ? undefined : (topbarRegionId ?? undefined)
  const params: SchemeQueryParams = {
    ...analyticsParams,
    page: 1,
    limit: 20,
    regionId: effectiveRegionId,
    search: paramsOverride?.search || undefined,
    schemeType: paramsOverride?.schemeType,
  }

  const schemesResult = useGetAllSchemesQuery(params)
  const kpisResult = useGetAllSchemeKpisQuery(params)

  const isLoading =
    schemesResult.isLoading ||
    schemesResult.isFetching ||
    kpisResult.isLoading ||
    kpisResult.isFetching
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
