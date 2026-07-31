import type { DateRange } from '@/components/common/DateRangeFilter/DateRangeFilter'

export type AnalyticsPreset =
  | 'today'
  | '7d'
  | '30d'
  | '90d'
  | 'thisMonth'
  | 'thisYear'
  | 'financialYear'
  | 'custom'

export interface AnalyticsDateParams {
  preset: AnalyticsPreset
  startDate?: string
  endDate?: string
}

const PRESET_LABEL_MAP: Record<string, AnalyticsPreset> = {
  Today: 'today',
  'Last 7 Days': '7d',
  'Last 30 Days': '30d',
  'Last 90 Days': '90d',
  'This Month': 'thisMonth',
  'This Year': 'thisYear',
  'Financial Year': 'financialYear',
  'Custom Range': 'custom',
}

/**
 * Converts the topbar's DateRange (UI preset label + optional custom
 * from/to) into the analytics API's query param shape. `startDate`/
 * `endDate` are only included for `custom`, matching the API contract
 * (required together with preset=custom, ignored otherwise).
 */
export function dateRangeToAnalyticsParams(
  dateRange: DateRange,
): AnalyticsDateParams {
  const preset = PRESET_LABEL_MAP[dateRange.presetLabel] ?? '30d'

  if (preset === 'custom' && dateRange.from && dateRange.to) {
    return { preset, startDate: dateRange.from, endDate: dateRange.to }
  }

  return { preset }
}
