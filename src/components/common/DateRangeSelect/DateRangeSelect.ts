export type DateRangeValue = '7' | '30' | '90'

export const DATE_RANGE_OPTIONS: { value: DateRangeValue; label: string }[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]
