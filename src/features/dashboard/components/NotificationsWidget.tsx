import { Box, Stack, Typography } from '@mui/material'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import type { NotificationItem } from '@/features/dashboard/types/dashboard.types'

interface NotificationsWidgetProps {
  notifications: NotificationItem[]
}

export function NotificationsWidget({ notifications }: NotificationsWidgetProps) {
  return (
    <WidgetCard title="Notifications" subtitle="Recent system alerts">
      <Stack spacing={2}>
        {notifications.map((note) => (
          <Stack key={note.id} direction="row" spacing={1.5}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                mt: 0.75,
                flexShrink: 0,
                backgroundColor: note.read ? 'transparent' : 'secondary.main',
                border: note.read ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{note.title}</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {note.description}
              </Typography>
              <Typography variant="caption">{note.time}</Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </WidgetCard>
  )
}
