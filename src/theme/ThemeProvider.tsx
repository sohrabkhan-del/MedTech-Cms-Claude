import type { ReactNode } from 'react'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import theme from '@/theme/theme'

interface AppThemeProviderProps {
  children: ReactNode
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
