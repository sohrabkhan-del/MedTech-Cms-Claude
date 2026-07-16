import { useEffect, useMemo, type ReactNode } from 'react'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { createAppTheme } from '@/theme/theme'
import { loadGoogleFont } from '@/theme/googleFonts'
import { useAppearance } from '@/contexts/AppearanceContext'

interface AppThemeProviderProps {
  children: ReactNode
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const { fontFamily } = useAppearance()

  useEffect(() => {
    loadGoogleFont(fontFamily)
  }, [fontFamily])

  const theme = useMemo(() => createAppTheme(fontFamily), [fontFamily])

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
