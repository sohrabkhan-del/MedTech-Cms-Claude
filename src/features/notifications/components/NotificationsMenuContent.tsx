import { Box, Button, Divider, MenuItem, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { markAsRead } from '@/features/notifications/slices/notificationsSlice'
import { selectNotifications, selectUnreadNotificationCount } from '@/features/notifications/slices/notificationsSelectors'
import { categoryConfig, formatRelativeTime } from '@/features/notifications/notificationDisplay'
import type { AppNotification } from '@/types/notification'

interface NotificationsMenuContentProps {
  onNavigate: () => void
  limit?: number
}

export function NotificationsMenuContent({ onNavigate, limit = 5 }: NotificationsMenuContentProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)
  const unreadCount = useAppSelector(selectUnreadNotificationCount)
  const recentNotifications = notifications.slice(0, limit)

  function openNotification(notification: AppNotification) {
    if (!notification.isRead) dispatch(markAsRead(notification.id))
    onNavigate()
    navigate(`/notifications/${notification.id}`)
  }

  return (
    <Box sx={{ width: 360 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Notifications</Typography>
        {unreadCount > 0 && (
          <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>
            {unreadCount} unread
          </Typography>
        )}
      </Stack>
      <Divider />
      {recentNotifications.length === 0 && (
        <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            You're all caught up.
          </Typography>
        </Box>
      )}
      {recentNotifications.map((notification) => {
        const Icon = categoryConfig[notification.category].icon
        return (
          <MenuItem
            key={notification.id}
            onClick={() => openNotification(notification)}
            sx={{ whiteSpace: 'normal', py: 1.25, alignItems: 'flex-start', gap: 1.25 }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${categoryConfig[notification.category].color}.light`,
                color: `${categoryConfig[notification.category].color}.main`,
                flexShrink: 0,
                mt: 0.25,
              }}
            >
              <Icon size={15} />
            </Box>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                {!notification.isRead && (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'secondary.main', flexShrink: 0 }} />
                )}
                <Typography sx={{ fontWeight: notification.isRead ? 500 : 700, fontSize: '0.8125rem' }} noWrap>
                  {notification.title}
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '0.75rem' }} noWrap>
                {notification.message}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {formatRelativeTime(notification.createdAt)}
              </Typography>
            </Box>
          </MenuItem>
        )
      })}
      <Divider />
      <Box sx={{ p: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => {
            onNavigate()
            navigate('/notifications')
          }}
        >
          View all notifications
        </Button>
      </Box>
    </Box>
  )
}
