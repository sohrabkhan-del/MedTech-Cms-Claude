export type DateRangeValue = '7' | '30' | '90'

export const DATE_RANGE_OPTIONS: { value: DateRangeValue; label: string }[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

export type ScanDateRangeValue = '1' | '3' | '5' | '7'

export const SCAN_DATE_RANGE_OPTIONS: { value: ScanDateRangeValue; label: string }[] = [
  { value: '1', label: '1 Day' },
  { value: '3', label: '3 Days' },
  { value: '5', label: '5 Days' },
  { value: '7', label: '7 Days' },
]
