import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

export function useIsMobile() {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.down('sm'))
}

export function useIsTablet() {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.between('sm', 'lg'))
}
