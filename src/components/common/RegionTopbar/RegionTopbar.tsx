import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { DateRangeFilter, type DateRange } from '@/components/common/DateRangeFilter/DateRangeFilter'
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
      spacing={2}
      sx={{
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        p: 1,
        pl: 1.5,
        mb: 3,
        minHeight: 58,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${radius.xl}px`,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
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
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{title}</Typography>
            {live && (
              <Chip
                label="Live"
                size="small"
                icon={
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'success.main', ml: '8px !important' }} />
                }
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: 'success.light',
                  color: 'success.main',
                  '& .MuiChip-label': { pl: 0.5, pr: 1 },
                }}
              />
            )}
          </Stack>
          {subtitle && (
            <Typography variant="caption" sx={{ display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
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

        <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
      </Stack>
    </Stack>
  )
}
