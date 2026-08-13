import { useAnalyticsCardsParams } from '@/features/dashboard/hooks/useAnalyticsCardsParams'
import {
  useGetDashboardOverviewCardsQuery,
  useGetRecentRedemptionsCardQuery,
  useGetRecentScansCardQuery,
  useGetRewardSummaryCardQuery,
  useGetScanActivityGraphQuery,
  useGetTopPartnersCardQuery,
  useGetTopProductsCardQuery,
} from '@/features/dashboard/services/analyticsCardsApi'
import {
  useGetActivityTimelineQuery,
  useGetSchemePerformanceQuery,
} from '@/features/dashboard/services/dashboardApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type {
  DateRangeValue,
  ScanDateRangeValue,
} from '@/components/common/DateRangeSelect/DateRangeSelect'

export function useDashboardOverviewCards() {
  const params = useAnalyticsCardsParams()
  const { data, isLoading, isFetching, error: queryError } =
    useGetDashboardOverviewCardsQuery(params)
  return {
    overview: data ?? null,
    isLoading: isLoading || isFetching,
    error: queryError
      ? getApiErrorMessage(queryError, 'Failed to load dashboard overview.')
      : null,
  }
}

export function useScanActivityGraph(dateRange?: DateRangeValue) {
  const params = useAnalyticsCardsParams(dateRange)
  const { data, isLoading, isFetching, error: queryError } =
    useGetScanActivityGraphQuery(params)
  return {
    scanActivityGraph: data ?? [],
    isLoading: isLoading || isFetching,
    error: queryError
      ? getApiErrorMessage(queryError, 'Failed to load scan activity graph.')
      : null,
  }
}

export function useRecentScansCard(dateRange?: ScanDateRangeValue) {
  const params = useAnalyticsCardsParams(dateRange)
  const { data, isLoading, isFetching, error: queryError } =
    useGetRecentScansCardQuery(params)
  return {
    recentScans: data ?? [],
    isLoading: isLoading || isFetching,
    error: queryError
      ? getApiErrorMessage(queryError, 'Failed to load recent scans.')
      : null,
  }
}

export function useTopPartnersCard() {
  const params = useAnalyticsCardsParams()
  const { data, isLoading, isFetching, error: queryError } =
    useGetTopPartnersCardQuery(params)
  return {
    topDealers: data?.topDealers ?? [],
    topChemists: data?.topChemists ?? [],
    isLoading: isLoading || isFetching,
    error: queryError
      ? getApiErrorMessage(queryError, 'Failed to load top partners.')
      : null,
  }
}

export function useTopProductsCard() {
  const params = useAnalyticsCardsParams()
  const { data, isLoading, isFetching, error: queryError } =
    useGetTopProductsCardQuery(params)
  return {
    topProducts: data ?? [],
    isLoading: isLoading || isFetching,
    error: queryError
      ? getApiErrorMessage(queryError, 'Failed to load top products.')
      : null,
  }
}

export function useRecentRedemptionsCard(dateRange?: DateRangeValue) {
  const params = useAnalyticsCardsParams(dateRange)
  const { data, isLoading, isFetching, error: queryError } =
    useGetRecentRedemptionsCardQuery(params)
  return {
    recentRedemptions: data ?? [],
    isLoading: isLoading || isFetching,
    error: queryError
      ? getApiErrorMessage(queryError, 'Failed to load recent redemptions.')
      : null,
  }
}

export function useRewardSummaryCard(dateRange?: DateRangeValue) {
  const params = useAnalyticsCardsParams(dateRange)
  const { data, isLoading, isFetching, error: queryError } =
    useGetRewardSummaryCardQuery(params)
  return {
    rewardSummary: data ?? null,
    isLoading: isLoading || isFetching,
    error: queryError
      ? getApiErrorMessage(queryError, 'Failed to load reward summary.')
      : null,
  }
}

export function useActivityTimelineCard(dateRange?: DateRangeValue) {
  const params = useAnalyticsCardsParams(dateRange)
  const { data, isLoading, isFetching, error: queryError } =
    useGetActivityTimelineQuery(params)
  return {
    activityTimeline: data ?? [],
    isLoading: isLoading || isFetching,
    error: queryError
      ? getApiErrorMessage(queryError, 'Failed to load activity timeline.')
      : null,
  }
}

export function useSchemePerformanceCard(dateRange?: DateRangeValue) {
  const params = useAnalyticsCardsParams(dateRange)
  const { data, isLoading, isFetching, error: queryError } =
    useGetSchemePerformanceQuery(params)
  return {
    schemePerformance: data ?? [],
    isLoading: isLoading || isFetching,
    error: queryError
      ? getApiErrorMessage(queryError, 'Failed to load scheme performance.')
      : null,
  }
}
