import { Box, Stack, Typography } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import { leaderboard } from '@/pages/dashboard/mockData'

const rankColors = ['#F7941D', '#9CA3AF', '#B08D57']

export function LeaderboardWidget() {
  return (
    <WidgetCard title="Leaderboard" subtitle="Top point earners this month">
      <Stack spacing={2}>
        {leaderboard.map((entry) => (
          <Stack key={entry.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: entry.rank <= 3 ? rankColors[entry.rank - 1] : 'background.default',
                color: entry.rank <= 3 ? '#FFFFFF' : 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {entry.rank <= 3 ? <EmojiEventsIcon sx={{ fontSize: 14 }} /> : entry.rank}
            </Box>
            <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }} noWrap>
                {entry.name}
              </Typography>
              <Typography variant="caption">{entry.region}</Typography>
            </Stack>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'primary.main' }}>
              {entry.points.toLocaleString('en-IN')}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </WidgetCard>
  )
}
