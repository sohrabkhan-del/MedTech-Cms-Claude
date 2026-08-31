import { useNavigate } from 'react-router-dom'
import { Box, Button, Stack, Typography } from '@mui/material'
import { Trophy } from 'lucide-react'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import { NoData } from '@/components/common/NoData/NoData'
import type { LeaderboardEntry } from '@/features/dashboard/types/dashboard.types'

const rankColors = ['#F7941D', '#9CA3AF', '#B08D57']

interface LeaderboardWidgetProps {
  leaderboard: LeaderboardEntry[]
  title?: string
  subtitle?: string
  linkTo?: string
}

export function LeaderboardWidget({
  leaderboard,
  title = 'Leaderboard',
  subtitle = 'Top point earners this month',
  linkTo = '/reports/reward-reports',
}: LeaderboardWidgetProps) {
  const navigate = useNavigate()

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <WidgetCard
        title={title}
        subtitle={subtitle}
        onCardClick={() => navigate(linkTo)}
        headerAction={
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.875rem',
              color: 'primary.main',
            }}
          >
            Points
          </Typography>
        }
        footer={
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              navigate(linkTo)
            }}
          >
            View All
          </Button>
        }
      >
        <NoData />
      </WidgetCard>
    )
  }

  return (
    <WidgetCard
      title={title}
      subtitle={subtitle}
      onCardClick={() => navigate(linkTo)}
      headerAction={
        <Typography
          sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'primary.main' }}
        >
          Points
        </Typography>
      }
      footer={
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            navigate(linkTo)
          }}
        >
          View All
        </Button>
      }
    >
      <Stack spacing={2}>
        {leaderboard.map((entry) => (
          <Stack
            key={entry.id}
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
              cursor: entry.linkTo ? 'Pointer' : 'default',
              borderRadius: 1.5,
              px: 1,
              py: 0.5,
              mx: -1,
              border: '1px solid transparent',
              transition:
                'border-color 0.15s ease, background-color 0.15s ease',
              ...(entry.linkTo && {
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }),
            }}
            onClick={(e) => {
              if (!entry.linkTo) return
              e.stopPropagation()
              navigate(entry.linkTo)
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  entry.rank <= 3
                    ? rankColors[entry.rank - 1]
                    : 'background.default',
                color: entry.rank <= 3 ? '#FFFFFF' : 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {entry.rank <= 3 ? <Trophy size={14} /> : entry.rank}
            </Box>
            <Typography
              sx={{ fontWeight: 600, fontSize: '0.875rem', flexGrow: 1 }}
              noWrap
            >
              {entry.name}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.875rem',
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              {`${entry.Points.toLocaleString('en-IN')} `}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </WidgetCard>
  )
}
