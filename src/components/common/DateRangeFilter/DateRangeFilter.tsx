import { useState } from 'react'
import { Badge, Box, Button, Divider, IconButton, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { Calendar } from 'lucide-react'
import { radius } from '@/theme/tokens'

export interface DateRange {
  from: string | null
  to: string | null
  presetLabel: string
}

const PRESETS = ['Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Month', 'This Year', 'Financial Year'] as const
const DEFAULT_PRESET_LABEL = 'Last 30 Days'

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [customFrom, setCustomFrom] = useState(value.from ?? '')
  const [customTo, setCustomTo] = useState(value.to ?? '')

  const isApplied = value.presetLabel !== DEFAULT_PRESET_LABEL

  const open = (e: React.MouseEvent<HTMLElement>) => {
    setCustomFrom(value.from ?? '')
    setCustomTo(value.to ?? '')
    setAnchorEl(e.currentTarget)
  }
  const close = () => setAnchorEl(null)

  const selectPreset = (label: string) => {
    onChange({ from: null, to: null, presetLabel: label })
    close()
  }

  const applyCustom = () => {
    if (!customFrom || !customTo) return
    onChange({ from: customFrom, to: customTo, presetLabel: 'Custom Range' })
    close()
  }

  return (
    <>
      <Tooltip title={value.presetLabel}>
        <IconButton
          onClick={open}
          sx={{
            height: 36,
            width: 36,
            border: '1px solid',
            borderColor: isApplied ? 'secondary.main' : 'transparent',
            backgroundColor: 'secondary.light',
            color: 'secondary.dark',
            '&:hover': { borderColor: 'secondary.main', backgroundColor: 'secondary.light' },
          }}
          aria-label={`Date range: ${value.presetLabel}`}
        >
          <Badge
            variant="dot"
            invisible={!isApplied}
            color="secondary"
            sx={{ '& .MuiBadge-dot': { backgroundColor: 'secondary.dark' } }}
          >
            <Calendar size={16} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: `${radius.lg}px`, mt: 1, minWidth: 260 } } }}
      >
        {PRESETS.map((preset) => {
          const selected = value.presetLabel === preset
          return (
            <MenuItem
              key={preset}
              selected={selected}
              onClick={() => selectPreset(preset)}
              sx={{
                fontSize: '0.8125rem',
                '&.Mui-selected': {
                  color: 'secondary.dark',
                  fontWeight: 700,
                  backgroundColor: 'secondary.light',
                },
                '&.Mui-selected:hover': { backgroundColor: 'secondary.light' },
              }}
            >
              {preset}
            </MenuItem>
          )
        })}
        <Divider />
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
            Custom Range
          </Typography>
          <Stack spacing={1.25}>
            <TextField
              label="From"
              type="date"
              size="small"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="To"
              type="date"
              size="small"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button variant="contained" size="small" onClick={applyCustom} disabled={!customFrom || !customTo}>
              Apply
            </Button>
          </Stack>
        </Box>
      </Menu>
    </>
  )
}
