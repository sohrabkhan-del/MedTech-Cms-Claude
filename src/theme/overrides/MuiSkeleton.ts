import type { Components, Theme } from '@mui/material/styles'
import { radius } from '@/theme/tokens'

/**
 * Branded shimmer: a soft primary-tinted sweep instead of MUI's default
 * gray pulse, so loading states read as part of the product rather than
 * a generic placeholder.
 */
export const MuiSkeleton: Components<Theme>['MuiSkeleton'] = {
  defaultProps: {
    animation: 'wave',
  },
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor: theme.palette.primary.light,
      '&::after': {
        background: `linear-gradient(90deg, transparent, ${theme.palette.background.paper}66, transparent)`,
      },
    }),
    rounded: {
      borderRadius: radius.sm,
    },
    text: {
      borderRadius: radius.sm / 2,
      transform: 'scale(1, 0.85)',
    },
    circular: ({ theme }) => ({
      backgroundColor: theme.palette.primary.light,
      border: `1px solid ${theme.palette.primary.light}`,
    }),
  },
}
