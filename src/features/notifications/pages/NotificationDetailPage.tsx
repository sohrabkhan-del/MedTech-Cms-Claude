import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { ArrowRight, CheckCheck } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { markAsRead } from '@/features/notifications/slices/notificationsSlice'
import { selectNotificationById } from '@/features/notifications/slices/notificationsSelectors'
import { categoryConfig, formatRelativeTime, priorityConfig } from '@/features/notifications/notificationDisplay'

export function NotificationDetailPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { notificationId } = useParams<{ notificationId: string }>()
  const notification = useAppSelector(selectNotificationById(notificationId))

  useEffect(() => {
    if (notification && !notification.isRead) {
      dispatch(markAsRead(notification.id))
    }
  }, [notification, dispatch])

  if (!notification) {
    return (
      <EmptyState
        title="Notification not found"
        description="This notification may have been removed."
        actionLabel="Back to Notifications"
        onAction={() => navigate('/notifications')}
      />
    )
  }

  const Icon = categoryConfig[notification.category].icon

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${categoryConfig[notification.category].color}.light`,
              color: `${categoryConfig[notification.category].color}.main`,
            }}
          >
            <Icon size={20} />
          </Box>
          <Box>
            <Typography variant="h1">{notification.title}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {categoryConfig[notification.category].label} · {formatRelativeTime(notification.createdAt)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          {!notification.isRead && (
            <Button variant="outlined" startIcon={<CheckCheck size={18} />} onClick={() => dispatch(markAsRead(notification.id))} sx={{ fontSize: '0.75rem' }}>
              Mark as Read
            </Button>
          )}
          {notification.targetPath && (
            <Button
              variant="contained"
              endIcon={<ArrowRight size={18} />}
              onClick={() => navigate(notification.targetPath!)}
              sx={{ fontSize: '0.75rem' }}
            >
              Go to Related Page
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Category', value: categoryConfig[notification.category].label },
              {
                label: 'Priority',
                value: <Chip label={priorityConfig[notification.priority].label} size="small" color={priorityConfig[notification.priority].color} variant="filled" />,
              },
              { label: 'Status', value: <Chip label={notification.isRead ? 'Read' : 'Unread'} size="small" color={notification.isRead ? undefined : 'secondary'} variant={notification.isRead ? 'outlined' : 'filled'} /> },
              { label: 'Received', value: new Date(notification.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
              ...(notification.actorName ? [{ label: 'Related To', value: notification.actorName }] : []),
            ]}
          />
        </SectionCard>

        <SectionCard title="Message">
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            {notification.message}
          </Typography>
        </SectionCard>
      </Stack>
    </>
  )
}
