import { Box, Button, Stack, Typography } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined'
import { radius } from '@/theme/tokens'

interface WelcomeBannerProps {
  userName: string
  message?: string
  onPrimaryAction?: () => void
  primaryActionLabel?: string
  onSecondaryAction?: () => void
  secondaryActionLabel?: string
  statLabel?: string
  statValue?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function WelcomeBanner({
  userName,
  message = "Here's what's happening across your network today.",
  onPrimaryAction,
  primaryActionLabel = 'View Reports',
  onSecondaryAction,
  secondaryActionLabel = 'Add Scheme',
  statLabel = 'Scans today',
  statValue = '1,284',
}: WelcomeBannerProps) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: `${radius.xl}px`,
        background: 'linear-gradient(120deg, #15326E 0%, #1A3E8C 55%, #E8830A 150%)',
        color: '#FFFFFF',
        px: { xs: 3, md: 4.5 },
        py: { xs: 3.5, md: 4.5 },
        mb: 3,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          right: 120,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(247,148,29,0.18)',
        }}
      />

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={3}
        sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between', position: 'relative' }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
            {today}
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '1.875rem' }, mt: 0.5, mb: 1 }}>
            {getGreeting()}, {userName}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', maxWidth: 440, mb: 3 }}>
            {message}
          </Typography>

          <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={onPrimaryAction}
              endIcon={<ArrowForwardIcon />}
              sx={{
                backgroundColor: '#FFFFFF',
                color: 'primary.main',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
              }}
            >
              {primaryActionLabel}
            </Button>
            <Button
              variant="outlined"
              onClick={onSecondaryAction}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: '#FFFFFF',
                '&:hover': { borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              {secondaryActionLabel}
            </Button>
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: `${radius.lg}px`,
            px: 2.5,
            py: 2,
            backdropFilter: 'blur(6px)',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: `${radius.md}px`,
              backgroundColor: 'rgba(255,255,255,0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <InsertChartOutlinedIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.1 }}>{statValue}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              {statLabel}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}
