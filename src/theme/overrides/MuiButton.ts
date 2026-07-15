import type { Components, Theme } from '@mui/material/styles'
import { radius, transitions } from '@/theme/tokens'

export const MuiButton: Components<Theme>['MuiButton'] = {
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: ({ ownerState, theme }) => ({
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
      borderRadius: radius.md,
      height: 40,
      paddingLeft: 20,
      paddingRight: 20,
      transition: `background-color ${transitions.base}, border-color ${transitions.base}, box-shadow ${transitions.base}`,
      ...(ownerState.variant === 'contained' &&
        ownerState.color === 'primary' && {
          backgroundColor: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        }),
      ...(ownerState.variant === 'contained' &&
        ownerState.color === 'secondary' && {
          backgroundColor: '#FFFFFF',
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': {
            backgroundColor: theme.palette.background.default,
          },
        }),
      ...(ownerState.variant === 'outlined' &&
        ownerState.color === 'secondary' && {
          borderColor: theme.palette.secondary.main,
          color: theme.palette.secondary.main,
          '&:hover': {
            backgroundColor: theme.palette.secondary.main,
            color: '#FFFFFF',
            borderColor: theme.palette.secondary.main,
          },
        }),
      ...(ownerState.variant === 'outlined' &&
        ownerState.color === 'primary' && {
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: 'rgba(26, 62, 140, 0.04)',
          },
        }),
      ...(ownerState.variant === 'text' && {
        color: theme.palette.text.secondary,
        '&:hover': {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        },
      }),
      ...(ownerState.variant === 'contained' &&
        ownerState.color === 'error' && {
          backgroundColor: theme.palette.error.main,
          '&:hover': {
            backgroundColor: '#C93B40',
          },
        }),
    }),
  },
}
