import {
  useGetDealersQuery,
  useGetDealerAnalyticsQuery,
  type DealerQueryParams,
} from '@/features/userManagement/services/dealerApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useDealers(params?: DealerQueryParams) {
  const { dateRange } = useRegionFilter()
  const dealersResult = useGetDealersQuery(params)
  const analyticsResult = useGetDealerAnalyticsQuery(
    dateRangeToAnalyticsParams(dateRange),
  )
  const dealers = dealersResult.data ?? []

  const isLoading = dealersResult.isLoading || analyticsResult.isLoading
  const error = dealersResult.error
    ? getApiErrorMessage(dealersResult.error, 'Failed to load dealers.')
    : analyticsResult.error
      ? getApiErrorMessage(analyticsResult.error, 'Failed to load dealer analytics.')
      : null

  return {
    dealers,
    kpis: analyticsResult.data ?? {
      totalDealers: 0,
      activeDealers: 0,
      inactiveDealers: 0,
      pendingApproval: 0,
    },
    isLoading,
    error,
  }
}
