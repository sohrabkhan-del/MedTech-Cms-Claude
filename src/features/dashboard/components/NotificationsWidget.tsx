import { useNavigate } from 'react-router-dom'
import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import { useGetNotificationsQuery } from '@/features/notifications/services/notificationsApi'
import { formatRelativeTime } from '@/features/notifications/notificationDisplay'

export function NotificationsWidget() {
  const navigate = useNavigate()
  const { data: notifications = [], isLoading } = useGetNotificationsQuery()
  const recent = notifications.slice(0, 5)

  return (
    <WidgetCard
      title="Notifications"
      subtitle="Recent system alerts"
      onCardClick={() => navigate('/notifications')}
    >
      {isLoading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Stack
              key={i}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center' }}
            >
              <Skeleton
                variant="circular"
                width={8}
                height={8}
                sx={{ mt: 0.75 }}
              />
              <Box sx={{ minWidth: 0, width: '100%' }}>
                <Skeleton width="60%" height={16} />
                <Skeleton width="90%" height={14} />
                <Skeleton width="30%" height={12} />
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : recent.length === 0 ? (
        <Box
          sx={{
            width: '100%',
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography color="text.secondary">No notifications</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {recent.map((note) => (
            <Stack key={note.id} direction="row" spacing={1.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  mt: 0.75,
                  flexShrink: 0,
                  backgroundColor: note.isRead
                    ? 'transparent'
                    : 'secondary.main',
                  border: note.isRead ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {note.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {note.message}
                </Typography>
                <Typography variant="caption">
                  {formatRelativeTime(note.createdAt)}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
    </WidgetCard>
  )
}
