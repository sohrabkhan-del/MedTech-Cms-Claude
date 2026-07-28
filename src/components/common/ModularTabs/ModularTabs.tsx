import { useLayoutEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import { radius, transitions } from '@/theme/tokens'

export interface ModularTabsOption<T extends string> {
  label: string
  value: T
  count?: number
}

interface ModularTabsProps<T extends string> {
  tabs: ModularTabsOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Stretches tabs to fill the available width instead of sizing to content. */
  fullWidth?: boolean
  /** Disables all tabs (e.g. while a parent record is locked for editing). */
  disabled?: boolean
  /**
   * 'filled' (default): bordered pill track with a sliding gradient indicator behind the active tab.
   * 'outlined': no track/border — bare tab labels, active tab gets its own border + light fill.
   * 'underline': bare tab labels over a full-width baseline, with a sliding underline beneath the active tab.
   */
  variant?: 'filled' | 'outlined' | 'underline'
  /** Font size of the tab labels (any CSS font-size value, e.g. '0.875rem'). Defaults to '1rem'. */
  fontSize?: string | number
}

export function ModularTabs<T extends string>({
  tabs,
  value,
  onChange,
  fullWidth = false,
  disabled = false,
  variant = 'filled',
  fontSize = '1rem',
}: ModularTabsProps<T>) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const activeIndex = tabs.findIndex((tab) => tab.value === value)

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const el = tabRefs.current[activeIndex]
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeIndex, tabs.length])

  if (variant === 'underline') {
    return (
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: fullWidth ? '100%' : 'fit-content',
          borderBottom: '1px solid',
          borderColor: 'divider',
          overflowX: 'auto',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: -1,
            left: indicator.left,
            width: indicator.width,
            height: 3,
            borderRadius: '2px 2px 0 0',
            backgroundColor: 'primary.main',
            transition: `left ${transitions.base}, width ${transitions.base}`,
          }}
        />
        {tabs.map((tab, index) => {
          const active = value === tab.value
          return (
            <Box
              key={tab.value}
              component="button"
              type="button"
              disabled={disabled}
              ref={(el: HTMLButtonElement | null) => {
                tabRefs.current[index] = el
              }}
              onClick={() => onChange(tab.value)}
              sx={{
                flex: fullWidth ? 1 : 'initial',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                border: 'none',
                background: 'none',
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled && !active ? 0.5 : 1,
                px: 2,
                py: 1.25,
                fontSize,
                fontWeight: 700,
                fontFamily: 'inherit',
                color: active ? 'primary.main' : 'text.secondary',
                whiteSpace: 'nowrap',
                transition: `color ${transitions.base}`,
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <Box component="span" sx={{ ml: 0.25, opacity: 0.7 }}>
                  ({tab.count})
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    )
  }

  if (variant === 'outlined') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          width: fullWidth ? '100%' : 'fit-content',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => {
          const active = value === tab.value
          return (
            <Box
              key={tab.value}
              component="button"
              type="button"
              disabled={disabled}
              onClick={() => onChange(tab.value)}
              sx={{
                flex: fullWidth ? 1 : 'initial',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                border: '1px solid',
                borderColor: active ? 'primary.main' : 'transparent',
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled && !active ? 0.5 : 1,
                px: 2,
                py: 0.75,
                borderRadius: `${radius.md}px`,
                fontSize,
                fontWeight: 700,
                fontFamily: 'inherit',
                backgroundColor: active ? 'primary.light' : 'transparent',
                color: active ? 'primary.dark' : 'text.secondary',
                whiteSpace: 'nowrap',
                transition: `background-color ${transitions.base}, color ${transitions.base}, border-color ${transitions.base}`,
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <Box component="span" sx={{ ml: 0.25, opacity: 0.7 }}>
                  ({tab.count})
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        width: fullWidth ? '100%' : 'fit-content',
        border: '1px solid',
        borderColor: 'divider',
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
      {tabs.map((tab, index) => {
        const active = value === tab.value
        return (
          <Box
            key={tab.value}
            component="button"
            type="button"
            disabled={disabled}
            ref={(el: HTMLButtonElement | null) => {
              tabRefs.current[index] = el
            }}
            onClick={() => onChange(tab.value)}
            sx={{
              position: 'relative',
              zIndex: 1,
              flex: fullWidth ? 1 : 'initial',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              border: 'none',
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled && !active ? 0.5 : 1,
              px: 2,
              py: 0.75,
              borderRadius: '999px',
              fontSize,
              fontWeight: 700,
              fontFamily: 'inherit',
              backgroundColor: 'transparent',
              color: active ? 'primary.contrastText' : 'text.secondary',
              whiteSpace: 'nowrap',
              transition: `color ${transitions.base}`,
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <Box component="span" sx={{ ml: 0.25, opacity: 0.7 }}>
                ({tab.count})
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
