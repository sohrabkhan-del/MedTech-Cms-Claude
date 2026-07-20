import { TextField } from '@mui/material'

export interface DateRangeFieldsValue {
  fromDate: string
  toDate: string
}

interface DateRangeFieldsProps {
  fromDate: string
  toDate: string
  onFromDateChange: (value: string) => void
  onToDateChange: (value: string) => void
  fromLabel?: string
  toLabel?: string
}

/**
 * The `fromDate`/`toDate` MUI TextField pair (type="date", shrunk label) appears in
 * every report's FilterDrawer body with only the labels differing — this is the one
 * genuinely shared filter fragment. The rest of each FilterDrawer body (selects,
 * checkboxes, text filters) is heterogeneous per report type and stays page-local
 * rather than being forced through a generic abstraction.
 */
export function DateRangeFields({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  fromLabel = 'Date From',
  toLabel = 'Date To',
}: DateRangeFieldsProps) {
  return (
    <>
      <TextField
        type="date"
        label={fromLabel}
        size="small"
        slotProps={{ inputLabel: { shrink: true } }}
        value={fromDate}
        onChange={(e) => onFromDateChange(e.target.value)}
      />
      <TextField
        type="date"
        label={toLabel}
        size="small"
        slotProps={{ inputLabel: { shrink: true } }}
        value={toDate}
        onChange={(e) => onToDateChange(e.target.value)}
      />
    </>
  )
}
