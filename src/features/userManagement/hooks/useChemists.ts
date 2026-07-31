import {
  useGetChemistsQuery,
  useGetChemistAnalyticsQuery,
  type ChemistQueryParams,
} from '@/features/userManagement/services/chemistApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useChemists(params?: ChemistQueryParams) {
  const { dateRange } = useRegionFilter()
  const chemistsResult = useGetChemistsQuery(params)
  const analyticsResult = useGetChemistAnalyticsQuery(
    dateRangeToAnalyticsParams(dateRange),
  )
  const chemists = chemistsResult.data ?? []

  const isLoading = chemistsResult.isLoading || analyticsResult.isLoading
  const error = chemistsResult.error
    ? getApiErrorMessage(chemistsResult.error, 'Failed to load chemists.')
    : analyticsResult.error
      ? getApiErrorMessage(analyticsResult.error, 'Failed to load chemist analytics.')
      : null

  return {
    chemists,
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
