import type { Components, Theme } from '@mui/material/styles'

const softColorMap: Record<string, { bg: string; fg: string }> = {
  success: { bg: '#E6F4EA', fg: '#1E9E5A' },
  warning: { bg: '#FDF0DA', fg: '#B36A00' },
  error: { bg: '#FBE4E5', fg: '#E5484D' },
  info: { bg: '#E7ECFB', fg: '#1A3E8C' },
}

export const MuiChip: Components<Theme>['MuiChip'] = {
  styleOverrides: {
    root: ({ ownerState }) => {
      const soft = ownerState.color && softColorMap[ownerState.color]
      return {
        fontWeight: 600,
        fontSize: '0.75rem',
        borderRadius: 999,
        ...(ownerState.variant === 'filled' &&
          soft && {
            backgroundColor: soft.bg,
            color: soft.fg,
          }),
      }
    },
    label: {
      paddingLeft: 10,
      paddingRight: 10,
    },
  },
}
