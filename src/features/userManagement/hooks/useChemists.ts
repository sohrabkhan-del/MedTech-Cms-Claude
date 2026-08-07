import {
  useGetChemistsQuery,
  useGetChemistAnalyticsQuery,
  type ChemistQueryParams,
} from '@/features/userManagement/services/chemistApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useChemists(params?: ChemistQueryParams) {
  const { regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const effectiveRegionId = params?.regionId || topbarRegionId || undefined

  const chemistsResult = useGetChemistsQuery({
    ...params,
    ...analyticsParams,
    regionId: effectiveRegionId,
  })
  const analyticsResult = useGetChemistAnalyticsQuery({
    ...analyticsParams,
    regionId: effectiveRegionId,
  })
  const chemists = chemistsResult.data?.items ?? []
  const totalItems = chemistsResult.data?.totalItems ?? 0

  const isLoading = chemistsResult.isFetching || analyticsResult.isFetching
  const error = chemistsResult.error
    ? getApiErrorMessage(chemistsResult.error, 'Failed to load chemists.')
    : analyticsResult.error
      ? getApiErrorMessage(analyticsResult.error, 'Failed to load chemist analytics.')
      : null

  return {
    chemists,
    totalItems,
    kpis: analyticsResult.data ?? {
      totalChemists: 0,
      activeChemists: 0,
      inactiveChemists: 0,
      pendingApproval: 0,
    },
    isLoading,
    error,
  }
}
