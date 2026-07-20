import { Box, MenuItem, Select, Stack, Typography } from '@mui/material'
import { Palette as PaletteOutlined } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { useAppearance } from '@/contexts/AppearanceContext'
import { GOOGLE_FONTS } from '@/theme/googleFonts'

export function AppearanceSettingsPage() {
  const { fontFamily, setFontFamily } = useAppearance()

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'primary.light',
            color: 'primary.main',
          }}
        >
          <PaletteOutlined size={20} />
        </Box>
        <Box>
          <Typography variant="h1">Appearance</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Customize the font for your MedTech workspace.
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Font Family">
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            Choose a font — the change applies instantly across the whole app.
          </Typography>
          <Select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            size="small"
            sx={{ minWidth: 280, maxWidth: 360 }}
          >
            {GOOGLE_FONTS.map((font) => (
              <MenuItem key={font.value} value={font.value} sx={{ fontFamily: font.stack, fontSize: '0.9375rem' }}>
                {font.label}
              </MenuItem>
            ))}
          </Select>
        </SectionCard>
      </Stack>
    </>
  )
}
