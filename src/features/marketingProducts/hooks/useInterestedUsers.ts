import {
  useGetInterestedUsersQuery,
  useGetInterestedUserAnalyticsQuery,
  useFollowUpLeadMutation,
  useCloseLeadMutation,
  useDeleteLeadMutation,
  type InterestedUserQueryParams,
} from '@/features/marketingProducts/services/interestedUsersApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useInterestedUsers(params?: InterestedUserQueryParams) {
  const { regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const { preset, startDate, endDate } = analyticsParams

  const effectiveRegionId = params?.regionId || topbarRegionId || undefined

  const leadsResult = useGetInterestedUsersQuery({
    ...params,
    regionId: effectiveRegionId,
    preset,
    startDate,
    endDate,
  })
  const kpisResult = useGetInterestedUserAnalyticsQuery({
    ...analyticsParams,
    regionId: effectiveRegionId,
  })
  const [followUpLeadMutation] = useFollowUpLeadMutation()
  const [closeLeadMutation] = useCloseLeadMutation()
  const [deleteLeadMutation] = useDeleteLeadMutation()

  const isLoading = leadsResult.isFetching
  const isKpisLoading = kpisResult.isFetching
  const error = leadsResult.error
    ? getApiErrorMessage(leadsResult.error, 'Failed to load interested users.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load interested users.')
      : null

  async function followUp(
    id: string,
    followUpNote: string,
    closeReason?: string,
  ) {
    await followUpLeadMutation({ id, followUpNote, closeReason }).unwrap()
  }

  async function close(id: string, closeReason: string) {
    await closeLeadMutation({ id, closeReason }).unwrap()
  }

  async function remove(id: string) {
    await deleteLeadMutation(id).unwrap()
  }

  return {
    leads: leadsResult.data?.items ?? [],
    totalItems: leadsResult.data?.totalItems ?? 0,
    kpis: kpisResult.data ?? null,
    isLoading,
    isKpisLoading,
    error,
    followUp,
    close,
    remove,
  }
}
