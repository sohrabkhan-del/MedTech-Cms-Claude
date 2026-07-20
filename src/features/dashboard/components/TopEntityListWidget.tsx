import { Avatar, Stack, Typography } from '@mui/material'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import type { TopEntity } from '@/features/dashboard/types/dashboard.types'

interface TopEntityListWidgetProps {
  title: string
  subtitle?: string
  entities: TopEntity[]
}

export function TopEntityListWidget({ title, subtitle, entities }: TopEntityListWidgetProps) {
  return (
    <WidgetCard title={title} subtitle={subtitle}>
      <Stack spacing={2}>
        {entities.map((entity, index) => (
          <Stack key={entity.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: '0.75rem',
                fontWeight: 700,
                bgcolor: index === 0 ? 'secondary.light' : 'background.default',
                color: index === 0 ? 'secondary.dark' : 'text.secondary',
              }}
            >
              {index + 1}
            </Avatar>
            <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }} noWrap>
                {entity.name}
              </Typography>
              <Typography variant="caption">{entity.region}</Typography>
            </Stack>
            <Stack sx={{ alignItems: 'flex-end' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{entity.metricValue}</Typography>
              <Typography variant="caption">{entity.metricLabel}</Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </WidgetCard>
  )
}
