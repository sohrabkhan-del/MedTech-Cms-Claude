import {
  useGetAdminsQuery,
  useGetAdminAnalyticsQuery,
  type AdminQueryParams,
} from '@/features/systemUsers/services/adminsApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useAdmins(params?: AdminQueryParams) {
  const { regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const { preset, startDate, endDate } = analyticsParams

  const effectiveRegionId = params?.regionId || topbarRegionId || undefined

  const adminsResult = useGetAdminsQuery({
    ...params,
    regionId: effectiveRegionId,
    preset,
    startDate,
    endDate,
  })
  const kpisResult = useGetAdminAnalyticsQuery({
    ...analyticsParams,
    regionId: effectiveRegionId,
  })

  const isLoading = adminsResult.isFetching || kpisResult.isFetching
  const error = adminsResult.error
    ? getApiErrorMessage(adminsResult.error, 'Failed to load admins.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load admins.')
      : null

  return {
    admins: adminsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
