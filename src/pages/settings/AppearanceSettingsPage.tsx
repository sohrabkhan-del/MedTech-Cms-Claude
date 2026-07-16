import { Box, Grid, MenuItem, Select, Stack, Typography } from '@mui/material'
import PaletteOutlined from '@mui/icons-material/PaletteOutlined'
import CheckCircle from '@mui/icons-material/CheckCircle'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { useAppearance, type SidebarVariant } from '@/contexts/AppearanceContext'
import { GOOGLE_FONTS } from '@/theme/googleFonts'
import { sidebarPalettes } from '@/components/layout/Sidebar/sidebarPalettes'
import { radius } from '@/theme/tokens'

const SIDEBAR_VARIANT_OPTIONS: { value: SidebarVariant; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function SidebarVariantPreview({ variant, selected, onSelect }: { variant: SidebarVariant; selected: boolean; onSelect: () => void }) {
  const palette = sidebarPalettes[variant]
  const label = SIDEBAR_VARIANT_OPTIONS.find((o) => o.value === variant)!.label

  return (
    <Box
      onClick={onSelect}
      sx={{
        cursor: 'pointer',
        borderRadius: `${radius.lg}px`,
        border: '2px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        overflow: 'hidden',
        transition: 'border-color 150ms',
        position: 'relative',
      }}
    >
      {selected && (
        <CheckCircle
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'primary.main',
            fontSize: 20,
            zIndex: 1,
            backgroundColor: 'background.paper',
            borderRadius: '50%',
          }}
        />
      )}
      <Stack direction="row" sx={{ height: 120 }}>
        <Box sx={{ width: 44, backgroundColor: palette.background, p: 1 }}>
          <Stack spacing={0.75}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  height: 8,
                  borderRadius: '4px',
                  backgroundColor: i === 0 ? palette.activeIconColor : palette.textDisabled,
                  opacity: i === 0 ? 1 : 0.5,
                }}
              />
            ))}
          </Stack>
        </Box>
        <Box sx={{ flexGrow: 1, backgroundColor: 'background.default', p: 1 }}>
          <Stack spacing={0.75}>
            <Box sx={{ height: 8, width: '60%', borderRadius: '4px', backgroundColor: 'divider' }} />
            <Box sx={{ height: 24, borderRadius: '4px', backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }} />
          </Stack>
        </Box>
      </Stack>
      <Box sx={{ px: 1.5, py: 1, backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{label}</Typography>
      </Box>
    </Box>
  )
}

export function AppearanceSettingsPage() {
  const { fontFamily, setFontFamily, sidebarVariant, setSidebarVariant } = useAppearance()

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
          <PaletteOutlined fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h1">Appearance</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Customize the font and sidebar style for your MedTech workspace.
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
          <Box sx={{ mt: 2.5, p: 2, borderRadius: `${radius.md}px`, backgroundColor: 'background.default' }}>
            <Typography sx={{ fontFamily, fontWeight: 700, fontSize: '1.0625rem', mb: 0.5 }}>
              The quick brown fox jumps over the lazy dog
            </Typography>
            <Typography sx={{ fontFamily, fontSize: '0.8125rem', color: 'text.secondary' }}>
              0123456789 — Approval Requests, Dealers, Chemists, Product Master
            </Typography>
          </Box>
        </SectionCard>

        <SectionCard title="Sidebar Style">
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            Pick how the navigation sidebar looks.
          </Typography>
          <Grid container spacing={2}>
            {SIDEBAR_VARIANT_OPTIONS.map((option) => (
              <Grid key={option.value} size={{ xs: 12, sm: 6, md: 4 }}>
                <SidebarVariantPreview
                  variant={option.value}
                  selected={sidebarVariant === option.value}
                  onSelect={() => setSidebarVariant(option.value)}
                />
              </Grid>
            ))}
          </Grid>
        </SectionCard>
      </Stack>
    </>
  )
}
