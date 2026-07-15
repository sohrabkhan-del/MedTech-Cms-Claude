import { useState } from 'react'
import { Box, Button, Divider, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { radius } from '@/theme/tokens'

export interface DateRange {
  from: string | null
  to: string | null
  presetLabel: string
}

const PRESETS = ['Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Month', 'This Year'] as const

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [customFrom, setCustomFrom] = useState(value.from ?? '')
  const [customTo, setCustomTo] = useState(value.to ?? '')

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
      <Button
        onClick={open}
        variant="outlined"
        color="secondary"
        startIcon={<CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />}
        endIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
        sx={{
          height: 36,
          fontSize: '0.75rem',
          backgroundColor: 'secondary.light',
          borderColor: 'transparent',
          color: 'secondary.dark',
          '&:hover': { borderColor: 'secondary.main', backgroundColor: 'secondary.light' },
        }}
      >
        {value.presetLabel}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: `${radius.lg}px`, mt: 1, minWidth: 260 } } }}
      >
        {PRESETS.map((preset) => (
          <MenuItem key={preset} onClick={() => selectPreset(preset)} sx={{ fontSize: '0.8125rem' }}>
            {preset}
          </MenuItem>
        ))}
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
