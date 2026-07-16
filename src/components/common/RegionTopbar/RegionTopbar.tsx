import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Box, Chip, MenuItem, Select, Stack, Typography } from '@mui/material'
import {
  DateRangeFilter,
  type DateRange,
} from '@/components/common/DateRangeFilter/DateRangeFilter'
import { useIsMobile } from '@/hooks/useMediaQueryBreakpoint'
import { radius, transitions } from '@/theme/tokens'

const REGIONS = ['All India', 'North', 'South', 'East', 'West']

interface RegionTopbarProps {
  icon: ReactNode
  title: string
  subtitle?: string
  live?: boolean
  region: string
  onRegionChange: (region: string) => void
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

export function RegionTopbar({
  icon,
  title,
  subtitle,
  live = true,
  region,
  onRegionChange,
  dateRange,
  onDateRangeChange,
}: RegionTopbarProps) {
  const isMobile = useIsMobile()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const activeIndex = REGIONS.indexOf(region)

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const el = tabRefs.current[activeIndex]
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeIndex])

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2.5}
      sx={{
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        p: { xs: 2, md: 1.25 },
        mb: 1,
        minHeight: { xs: 'auto', md: 58 },
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${radius.xl}px`,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', minWidth: 0 }}
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: `${radius.md}px`,
            background: 'linear-gradient(135deg, #1A3E8C 0%, #15326E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}
          >
            <Typography
              sx={{ fontWeight: 700, fontSize: '1.0625rem', lineHeight: 1.3 }}
            >
              {title}
            </Typography>
            {live && (
              <Chip
                label="Live"
                size="small"
                icon={
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'success.main',
                      ml: '8px !important',
                    }}
                  />
                }
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor: 'success.light',
                  color: 'success.main',
                  '& .MuiChip-label': { pl: 1, pr: 1.25 },
                }}
              />
            )}
          </Stack>
          {subtitle && (
            <Typography
              variant="body1"
              sx={{
                display: 'block',
                color: 'text.secondary',
                mt: 0.5,
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          flexWrap: { xs: 'nowrap', sm: 'wrap' },
          rowGap: 1.5,
        }}
      >
        {isMobile ? (
          <Select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            size="small"
            sx={{
              flex: 1,
              minWidth: 0,
              borderRadius: '999px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              backgroundColor: 'background.default',
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            }}
          >
            {REGIONS.map((r) => (
              <MenuItem key={r} value={r} sx={{ fontSize: '0.8125rem' }}>
                {r}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'background.default',
              borderRadius: '999px',
              p: 0.5,
              overflowX: 'auto',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                bottom: 4,
                left: indicator.left,
                width: indicator.width,
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #1A3E8C 0%, #15326E 100%)',
                transition: `left ${transitions.base}, width ${transitions.base}`,
                zIndex: 0,
              }}
            />
            {REGIONS.map((r, index) => {
              const active = r === region
              return (
                <Box
                  key={r}
                  component="button"
                  type="button"
                  ref={(el: HTMLButtonElement | null) => {
                    tabRefs.current[index] = el
                  }}
                  onClick={() => onRegionChange(r)}
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    border: 'none',
                    cursor: 'pointer',
                    px: 2,
                    py: 0.75,
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    backgroundColor: 'transparent',
                    color: active ? 'primary.contrastText' : 'text.secondary',
                    whiteSpace: 'nowrap',
                    transition: `color ${transitions.base}`,
                  }}
                >
                  {r}
                </Box>
              )
            })}
          </Box>
        )}
        <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
      </Stack>
    </Stack>
  )
}
