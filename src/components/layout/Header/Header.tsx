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
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import SettingsIcon from '@mui/icons-material/Settings'
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
          <MenuIcon fontSize="small" />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
          <IconButton
            onClick={toggleFullscreen}
            size="small"
            aria-label="Toggle fullscreen"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            {isFullscreen ? (
              <FullscreenExitIcon fontSize="small" />
            ) : (
              <FullscreenIcon fontSize="small" />
            )}
          </IconButton>

          <IconButton
            onClick={(e) => setNotifAnchor(e.currentTarget)}
            size="small"
            aria-label="Notifications"
          >
            <Badge badgeContent={notificationCount} color="secondary">
              <NotificationsNoneIcon fontSize="small" />
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
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  )
}
