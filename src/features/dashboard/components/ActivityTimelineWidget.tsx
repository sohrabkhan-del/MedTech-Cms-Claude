import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Stack, Typography } from '@mui/material'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import type { DateRangeValue } from '@/components/common/DateRangeSelect/DateRangeSelect'
import type { ActivityEvent } from '@/features/dashboard/types/dashboard.types'

interface ActivityTimelineWidgetProps {
  activityTimeline: ActivityEvent[]
}

export function ActivityTimelineWidget({ activityTimeline }: ActivityTimelineWidgetProps) {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<DateRangeValue>('7')

  return (
    <WidgetCard
      title="Activity Timeline"
      subtitle="Latest actions across the platform"
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      onCardClick={() => navigate('/audit/audit-logs')}
    >
      <Stack spacing={0}>
        {activityTimeline.map((event, index) => (
          <Stack
            key={event.id}
            direction="row"
            spacing={1.5}
            sx={{ cursor: event.linkTo ? 'pointer' : 'default' }}
            onClick={(e) => {
              if (!event.linkTo) return
              e.stopPropagation()
              navigate(event.linkTo)
            }}
          >
            <Stack sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main', mt: 0.6 }} />
              {index < activityTimeline.length - 1 && (
                <Box sx={{ width: '1px', flexGrow: 1, minHeight: 28, backgroundColor: 'divider' }} />
              )}
            </Stack>
            <Box sx={{ pb: 2.5 }}>
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                <Typography component="span" sx={{ fontWeight: 700, fontSize: 'inherit' }}>
                  {event.actor}
                </Typography>{' '}
                {event.action}{' '}
                <Typography component="span" sx={{ fontWeight: 600, fontSize: 'inherit', color: 'primary.main' }}>
                  {event.target}
                </Typography>
              </Typography>
              <Typography variant="caption">{event.timestamp}</Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </WidgetCard>
  )
}
