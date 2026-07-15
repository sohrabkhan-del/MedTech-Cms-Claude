import type { Components, Theme } from '@mui/material/styles'
import { transitions } from '@/theme/tokens'

export const MuiTableCell: Components<Theme>['MuiTableCell'] = {
  styleOverrides: {
    head: ({ theme }) => ({
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.background.default,
      borderBottom: `1px solid ${theme.palette.divider}`,
      paddingTop: 14,
      paddingBottom: 14,
    }),
    body: ({ theme }) => ({
      fontSize: '0.875rem',
      color: theme.palette.text.primary,
      borderBottom: `1px solid ${theme.palette.divider}`,
      paddingTop: 16,
      paddingBottom: 16,
    }),
  },
}

export const MuiTableRow: Components<Theme>['MuiTableRow'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      transition: `background-color ${transitions.base}`,
      '&:last-of-type td': {
        borderBottom: 'none',
      },
      '&:hover': {
        backgroundColor: theme.palette.background.default,
      },
    }),
  },
}

export const MuiTableHead: Components<Theme>['MuiTableHead'] = {
  styleOverrides: {
    root: {
      position: 'sticky',
      top: 0,
      zIndex: 1,
    },
  },
}
