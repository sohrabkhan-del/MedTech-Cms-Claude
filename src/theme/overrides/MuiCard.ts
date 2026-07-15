import type { Components, Theme } from '@mui/material/styles'
import { radius, shadows, transitions } from '@/theme/tokens'

export const MuiCard: Components<Theme>['MuiCard'] = {
  defaultProps: {
    elevation: 0,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: radius.xl,
      boxShadow: shadows.card,
      border: `1px solid ${theme.palette.divider}`,
      transition: `box-shadow ${transitions.base}, transform ${transitions.base}`,
    }),
  },
}

export const MuiPaper: Components<Theme>['MuiPaper'] = {
  defaultProps: {
    elevation: 0,
  },
  styleOverrides: {
    root: {
      backgroundImage: 'none',
    },
  },
}
