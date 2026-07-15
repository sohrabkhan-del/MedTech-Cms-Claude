import type { Components, Theme } from '@mui/material/styles'
import { radius, transitions } from '@/theme/tokens'

export const MuiOutlinedInput: Components<Theme>['MuiOutlinedInput'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: radius.md,
      height: 44,
      backgroundColor: theme.palette.background.paper,
      transition: `box-shadow ${transitions.base}, border-color ${transitions.base}`,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.divider,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 1.5,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 3px rgba(26, 62, 140, 0.12)`,
      },
      '&.Mui-error.Mui-focused': {
        boxShadow: `0 0 0 3px rgba(229, 72, 77, 0.12)`,
      },
    }),
    input: {
      padding: '10px 14px',
    },
    multiline: {
      height: 'auto',
    },
  },
}

export const MuiInputLabel: Components<Theme>['MuiInputLabel'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      fontSize: '0.875rem',
      color: theme.palette.text.secondary,
    }),
  },
}

export const MuiFormHelperText: Components<Theme>['MuiFormHelperText'] = {
  styleOverrides: {
    root: {
      marginLeft: 2,
      fontSize: '0.75rem',
    },
  },
}
