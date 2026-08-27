import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Box, Chip, MenuItem, Select, Stack, Typography } from '@mui/material'
import { CircleCheck } from 'lucide-react'
import {
  DateRangeFilter,
  type DateRange,
} from '@/components/common/DateRangeFilter/DateRangeFilter'
import { useIsMobile } from '@/hooks/useMediaQueryBreakPoint'
import { radius, transitions } from '@/theme/tokens'
import type { RegionOption } from '@/contexts/RegionFilterContext'
import { fallbackRegions, getRegions } from '@/services/regionsService'

interface RegionTopbarProps {
  icon: ReactNode
  title: string
  subtitle?: string
  live?: boolean
  region: string
  onRegionChange: (region: RegionOption) => void
  /** Hides the region (All India/North/South/East/West) selector for pages where it doesn't apply. */
  hideRegionSelector?: boolean
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
  hideRegionSelector = false,
  dateRange,
  onDateRangeChange,
}: RegionTopbarProps) {
  const isMobile = useIsMobile()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [regions, setRegions] = useState<RegionOption[]>(fallbackRegions)

  // -1 when `region` doesn't match anything currently loaded (e.g. fallback vs
  // fetched list mismatch, or fetch still in flight). We no longer clamp this
  // to 0 — clamping was silently highlighting the first tab even when no
  // button actually matched `region`, which is the "wrong tab lit up" bug.
  const activeIndex = regions.findIndex((option) => option.name === region)

  useEffect(() => {
    let ignore = false

    getRegions()
      .then((options) => {
        if (!ignore && options.length > 0) {
          // Sanity check: duplicate/missing ids will scramble tabRefs indices
          // and React's reconciliation of the keyed buttons below.
          const ids = options.map((o) => o.id)
          const uniqueIds = new Set(ids)
          if (uniqueIds.size !== ids.length || ids.some((id) => !id)) {
            console.warn(
              '[regions] received regions with missing or duplicate ids',
              options,
            )
          }
          setRegions(options)
        }
      })
      .catch((error) => {
        console.warn('[regions] failed to load regions, using fallback', error)
      })

    return () => {
      ignore = true
    }
  }, [])

  useLayoutEffect(() => {
    if (activeIndex < 0) {
      // No matching region loaded yet — hide the pill instead of falsely
      // highlighting tab 0.
      setIndicator({ left: 0, width: 0 })
      return
    }

    const updateIndicator = () => {
      const el = tabRefs.current[activeIndex]
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }

    // Named handler so removeEventListener actually matches what was added.
    // (Previously this was an inline arrow fn passed to addEventListener but
    // `updateIndicator` was passed to removeEventListener — different
    // references, so the listener was never removed and piled up on every
    // effect re-run, eventually causing the indicator to flicker/disappear.)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') updateIndicator()
    }

    updateIndicator()

    // Recalc on window resize
    window.addEventListener('resize', updateIndicator)

    // Recalc when tab becomes visible again after being backgrounded
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Recalc if the tab element itself resizes (e.g. text/width changes after regions load)
    const el = tabRefs.current[activeIndex]
    let ro: ResizeObserver | undefined
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateIndicator)
      ro.observe(el)
    }

    return () => {
      window.removeEventListener('resize', updateIndicator)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      ro?.disconnect()
    }
  }, [activeIndex, regions])

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2.5}
      sx={{
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        p: { xs: 2, md: 1.25 },
        mb: 3,
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
                      animation:
                        'region-topbar-live-pulse 1.6s ease-in-out infinite',
                      '@keyframes region-topbar-live-pulse': {
                        '0%, 100%': {
                          opacity: 1,
                          boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.5)',
                        },
                        '50%': {
                          opacity: 0.6,
                          boxShadow: '0 0 0 4px rgba(46, 125, 50, 0)',
                        },
                      },
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
        {hideRegionSelector ? null : isMobile ? (
          <Select
            value={region}
            onChange={(e) => {
              const selected = regions.find(
                (option) => option.name === e.target.value,
              )
              if (selected) onRegionChange(selected)
            }}
            size="small"
            renderValue={(value) => (
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: 'center' }}
              >
                <CircleCheck size={14} />
                <span>{value}</span>
              </Stack>
            )}
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
            {regions.map((r) => (
              <MenuItem
                key={r.id}
                value={r.name}
                sx={{ fontSize: '0.8125rem', gap: 1 }}
              >
                {r.name === region && <CircleCheck size={14} />}
                {r.name}
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
            {regions.map((r, index) => {
              const active = r.name === region
              return (
                <Box
                  key={r.id}
                  component="button"
                  type="button"
                  ref={(el: HTMLButtonElement | null) => {
                    tabRefs.current[index] = el
                  }}
                  onClick={() => onRegionChange(r)}
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
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
                  {r.name}
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
