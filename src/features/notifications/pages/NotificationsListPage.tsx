import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Tabs, Tab, Typography } from '@mui/material'
import { Bell, BellRing, CheckCheck, MailOpen } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { markAllAsRead, markAsRead } from '@/features/notifications/slices/notificationsSlice'
import { selectNotifications } from '@/features/notifications/slices/notificationsSelectors'
import { categoryConfig, formatRelativeTime, priorityConfig } from '@/features/notifications/notificationDisplay'
import type { AppNotification } from '@/types/notification'

export function NotificationsListPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)
  const [tab, setTab] = useState<'all' | 'unread'>('all')

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const visibleNotifications = tab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications

  function openNotification(notification: AppNotification) {
    if (!notification.isRead) dispatch(markAsRead(notification.id))
    navigate(`/notifications/${notification.id}`)
  }

  const columns: CommonTableColumn<AppNotification>[] = [
    {
      key: 'title',
      header: 'Notification',
      minWidth: 320,
      render: (row) => {
        const Icon = categoryConfig[row.category].icon
        return (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', cursor: 'pointer' }} onClick={() => openNotification(row)}>
            {!row.isRead && (
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'secondary.main', flexShrink: 0 }} />
            )}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${categoryConfig[row.category].color}.light`,
                color: `${categoryConfig[row.category].color}.main`,
                flexShrink: 0,
              }}
            >
              <Icon size={16} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: row.isRead ? 500 : 700, fontSize: '0.8125rem' }} noWrap>
                {row.title}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '0.75rem' }} noWrap>
                {row.message}
              </Typography>
            </Box>
          </Stack>
        )
      },
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      sortValue: (row) => categoryConfig[row.category].label,
      render: (row) => <Chip label={categoryConfig[row.category].label} size="small" variant="outlined" />,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      sortValue: (row) => row.priority,
      render: (row) => (
        <Chip label={priorityConfig[row.priority].label} size="small" color={priorityConfig[row.priority].color} variant="filled" />
      ),
    },
    {
      key: 'createdAt',
      header: 'Received',
      minWidth: 110,
      sortable: true,
      sortValue: (row) => row.createdAt,
      render: (row) => formatRelativeTime(row.createdAt),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Chip label={row.isRead ? 'Read' : 'Unread'} size="small" color={row.isRead ? undefined : 'secondary'} variant={row.isRead ? 'outlined' : 'filled'} />
      ),
    },
  ]

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
              backgroundColor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <Bell size={20} />
          </Box>
          <Box>
            <Typography variant="h1">Notifications</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Stay on top of approvals, alerts, and platform activity.
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          size="small"
          startIcon={<CheckCheck size={16} />}
          disabled={unreadCount === 0}
          onClick={() => dispatch(markAllAsRead())}
        >
          Mark all as read
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard label="Total Notifications" value={notifications.length} icon={<Bell size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard label="Unread" value={unreadCount} icon={<BellRing size={20} />} iconColor="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard label="Read" value={notifications.length - unreadCount} icon={<MailOpen size={20} />} iconColor="success" />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2, minHeight: 36 }}>
        <Tab value="all" label={`All (${notifications.length})`} sx={{ minHeight: 36, fontSize: '0.8125rem' }} />
        <Tab value="unread" label={`Unread (${unreadCount})`} sx={{ minHeight: 36, fontSize: '0.8125rem' }} />
      </Tabs>

      <CommonTable
        tableKey="notifications-list"
        columns={columns}
        rows={visibleNotifications}
        getRowId={(row) => row.id}
        searchPlaceholder="Search notifications…"
        searchKeys={(row) => `${row.title} ${row.message} ${categoryConfig[row.category].label}`}
        defaultSortBy="createdAt"
        defaultSortDir="desc"
        actions={[
          { label: 'View Details', onClick: (row) => openNotification(row) },
          { label: 'Mark as Read', onClick: (row) => dispatch(markAsRead(row.id)) },
        ]}
        emptyTitle={tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
        emptyDescription="You're all caught up."
      />
    </>
  )
}
