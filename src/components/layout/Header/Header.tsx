import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Badge,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { Menu as MenuIcon, Bell, Maximize, Minimize, Settings as SettingsIcon } from 'lucide-react'
import { layout, radius, shadows } from '@/theme/tokens'

interface HeaderProps {
  onMenuClick: () => void
  notificationCount?: number
}

export function Header({
  onMenuClick,
  notificationCount = 4,
}: HeaderProps) {
  const navigate = useNavigate()
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
        top: 16,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        mx: { xs: 2, sm: 3 },
        mb: 3,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          height: layout.headerHeight,
          px: 2,
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
            <Badge badgeContent={notificationCount} color="secondary">
              <Bell size={20} />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notifAnchor}
            open={!!notifAnchor}
            onClose={() => setNotifAnchor(null)}
            slotProps={{
              paper: {
                sx: { width: 320, borderRadius: `${radius.lg}px`, mt: 1 },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                Notifications
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => setNotifAnchor(null)}
              sx={{ whiteSpace: 'normal', py: 1.25 }}
            >
              <Typography variant="body1">
                3 new approval requests are awaiting review.
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => setNotifAnchor(null)}
              sx={{ whiteSpace: 'normal', py: 1.25 }}
            >
              <Typography variant="body1">
                Factory inventory upload completed successfully.
              </Typography>
            </MenuItem>
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
