import { Box, Stack } from '@mui/material'
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
}

export function ModularTabs<T extends string>({
  tabs,
  value,
  onChange,
  fullWidth = false,
  disabled = false,
}: ModularTabsProps<T>) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        p: 0.5,
        width: fullWidth ? '100%' : 'fit-content',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${radius.lg}px`,
        backgroundColor: 'background.paper',
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
              border: '1px solid',
              borderColor: active ? 'primary.main' : 'transparent',
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled && !active ? 0.5 : 1,
              px: 2,
              py: 0.75,
              borderRadius: `${radius.md}px`,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'inherit',
              backgroundColor: active ? 'primary.light' : 'transparent',
              color: active ? 'primary.dark' : 'text.secondary',
              whiteSpace: 'nowrap',
              transition: `background-color ${transitions.base}, color ${transitions.base}, border-color ${transitions.base}`,
              ...(!disabled && {
                '&:hover': {
                  backgroundColor: active
                    ? 'primary.light'
                    : 'background.default',
                },
              }),
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <Box component="span" sx={{ ml: 0.75, opacity: 0.7 }}>
                ({tab.count})
              </Box>
            )}
          </Box>
        )
      })}
    </Stack>
  )
}
