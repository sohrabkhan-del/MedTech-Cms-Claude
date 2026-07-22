import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Box, IconButton, Menu, Stack } from '@mui/material'
import {
  Menu as MenuIcon,
  Bell,
  Maximize,
  Minimize,
  Settings as SettingsIcon,
} from 'lucide-react'
import { layout, radius, shadows } from '@/theme/tokens'
import { useAppSelector } from '@/app/store/hooks'
import { selectUnreadNotificationCount } from '@/features/notifications/slices/notificationsSelectors'
import { NotificationsMenuContent } from '@/features/notifications/components/NotificationsMenuContent'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const unreadCount = useAppSelector(selectUnreadNotificationCount)
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      void document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        mb: 3,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: layout.headerHeight + 16,
          backgroundColor: 'rgba(245, 245, 245, 0.72)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      />
      <Stack
        direction="row"
        sx={{
          position: 'relative',
          alignItems: 'center',
          height: layout.headerHeight,
          px: 2,
          mx: { xs: 2, sm: 3 },
          mt: 2,
          backgroundColor: 'background.paper',
          borderRadius: `${radius.xl}px`,
          boxShadow: shadows.card,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton
          onClick={onMenuClick}
          edge="start"
          size="small"
          sx={{ mr: 1.5 }}
          aria-label="Toggle navigation"
        >
          <MenuIcon size={20} />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
          <IconButton
            onClick={toggleFullscreen}
            size="small"
            aria-label="Toggle fullscreen"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </IconButton>

          <IconButton
            onClick={(e) => setNotifAnchor(e.currentTarget)}
            size="small"
            aria-label="Notifications"
          >
            <Badge badgeContent={unreadCount} color="secondary">
              <Bell size={20} />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notifAnchor}
            open={!!notifAnchor}
            onClose={() => setNotifAnchor(null)}
            slotProps={{
              paper: {
                sx: { borderRadius: `${radius.lg}px`, mt: 1 },
              },
            }}
          >
            <NotificationsMenuContent onNavigate={() => setNotifAnchor(null)} />
          </Menu>

          <IconButton
            onClick={() => navigate('/settings/general')}
            size="small"
            aria-label="Settings"
          >
            <SettingsIcon size={20} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  )
}
