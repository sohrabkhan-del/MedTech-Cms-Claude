import { useMemo } from 'react'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import type { AnalyticsCardsQueryParams } from '@/features/dashboard/types/analyticsCards.types'
import type {
  DateRangeValue,
  ScanDateRangeValue,
} from '@/components/common/DateRangeSelect/DateRangeSelect'

const ALL_INDIA_REGION = 'All India'

/** Maps a card-local date-range dropdown value ('7' | '30' | '90' days, or the
 *  scan feed's '1' | '3' | '5' | '7' days) to the analytics API's `preset`. */
export function cardDateRangeToPreset(
  value: DateRangeValue | ScanDateRangeValue,
): string {
  switch (value) {
    case '1':
      return 'today'
    case '3':
    case '5':
    case '7':
      return '7d'
    case '30':
      return '30d'
    case '90':
      return '90d'
    default:
      return '30d'
  }
}

/** Builds the shared `{ preset, startDate, endDate, regionId }` params every
 *  analytics-cards endpoint accepts, from the global region/date topbar state.
 *  Pass `dateRangeOverride` to use a card-local dropdown value instead of the
 *  topbar's date range, so only that card's query key (and its refetch)
 *  changes when the card's own dropdown changes. */
export function useAnalyticsCardsParams(
  dateRangeOverride?: DateRangeValue | ScanDateRangeValue,
): AnalyticsCardsQueryParams {
  const { region, regionId, dateRange } = useRegionFilter()

  return useMemo(() => {
    const regionParam =
      region === ALL_INDIA_REGION ? undefined : (regionId ?? undefined)

    if (dateRangeOverride !== undefined) {
      return { preset: cardDateRangeToPreset(dateRangeOverride), regionId: regionParam }
    }

    const dateParams = dateRangeToAnalyticsParams(dateRange)
    return {
      ...dateParams,
      regionId: regionParam,
    }
  }, [dateRange, region, regionId, dateRangeOverride])
}
