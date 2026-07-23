import { useNavigate } from 'react-router-dom'
import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import type { SchemeProgress } from '@/features/dashboard/types/dashboard.types'

interface RewardProgressWidgetProps {
  schemePerformance: SchemeProgress[]
}

export function RewardProgressWidget({ schemePerformance }: RewardProgressWidgetProps) {
  const navigate = useNavigate()

  return (
    <WidgetCard
      title="Reward Progress"
      subtitle="Redemption completion across active schemes"
      onCardClick={() => navigate('/scheme-management/schemes/general')}
    >
      <Stack spacing={2.5}>
        {schemePerformance.map((scheme) => (
          <Box key={scheme.id}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{scheme.name}</Typography>
                <Chip
                  label={scheme.category}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.65rem', borderColor: 'divider', color: 'text.secondary' }}
                />
              </Stack>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'primary.main' }}>{scheme.progress}%</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={scheme.progress}
              sx={{
                height: 8,
                borderRadius: 999,
                backgroundColor: 'background.default',
                '& .MuiLinearProgress-bar': { borderRadius: 999, backgroundColor: 'secondary.main' },
              }}
            />
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
              Ends in {scheme.endsIn}
            </Typography>
          </Box>
        ))}
      </Stack>
    </WidgetCard>
  )
}
