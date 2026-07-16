import { createTheme, type Theme } from '@mui/material/styles'
import { colors, shape, typography } from '@/theme/tokens'
import { MuiButton } from '@/theme/overrides/MuiButton'
import { MuiChip } from '@/theme/overrides/MuiChip'
import { MuiCard, MuiPaper } from '@/theme/overrides/MuiCard'
import { MuiTableCell, MuiTableRow, MuiTableHead } from '@/theme/overrides/MuiTable'
import { MuiOutlinedInput, MuiInputLabel, MuiFormHelperText } from '@/theme/overrides/MuiTextField'
import { getFontOption } from '@/theme/googleFonts'

export function createAppTheme(fontFamily: string): Theme {
  const fontStack = getFontOption(fontFamily).stack

  return createTheme({
    palette: {
      mode: 'light',
      primary: colors.primary,
      secondary: colors.secondary,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      info: colors.info,
      background: colors.background,
      divider: colors.divider,
      text: colors.text,
    },
    shape,
    typography: {
      fontFamily: fontStack,
      fontSize: typography.baseFontSize,
      h1: typography.pageTitle,
      h2: typography.sectionTitle,
      body1: typography.body1,
      body2: { fontSize: '0.75rem' },
      subtitle1: { fontSize: '0.8125rem' },
      subtitle2: { fontSize: '0.75rem' },
      button: { fontSize: '0.8125rem', textTransform: 'none' },
      caption: typography.caption,
    },
    components: {
      MuiButton,
      MuiChip,
      MuiCard,
      MuiPaper,
      MuiTableCell,
      MuiTableRow,
      MuiTableHead,
      MuiOutlinedInput,
      MuiInputLabel,
      MuiFormHelperText,
    },
  })
}

const theme = createAppTheme('Inter')

export default theme
