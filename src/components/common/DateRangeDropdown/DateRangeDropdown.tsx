import { MenuItem, Select, type SelectChangeEvent } from '@mui/material'
import { ChevronDown } from 'lucide-react'
import { radius } from '@/theme/tokens'

export interface DateRangeDropdownOption<T extends string> {
  value: T
  label: string
}

interface DateRangeDropdownProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: DateRangeDropdownOption<T>[]
  'aria-label': string
  minWidth?: number
}

export function DateRangeDropdown<T extends string>({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
  minWidth = 100,
}: DateRangeDropdownProps<T>) {
  const handleChange = (e: SelectChangeEvent) => {
    onChange(e.target.value as T)
  }

  return (
    <Select
      size="small"
      value={value}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      aria-label={ariaLabel}
      IconComponent={(props) => <ChevronDown size={14} {...props} />}
      sx={{
        minWidth,
        height: 28,
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: 'text.secondary',
        backgroundColor: 'background.default',
        borderRadius: `${radius.sm}px`,
        '& .MuiSelect-select': {
          py: 0.25,
          pl: 1.25,
          pr: '28px !important',
          minHeight: 'unset',
          lineHeight: 1.4,
        },
        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        '& .MuiSelect-icon': {
          right: 8,
          color: 'text.secondary',
        },
        '&:hover': { backgroundColor: 'divider' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          border: '1px solid',
          borderColor: 'primary.main',
        },
      }}
    >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          sx={{ fontSize: '0.8125rem' }}
        >
          {option.label}
        </MenuItem>
      ))}
    </Select>
  )
}
