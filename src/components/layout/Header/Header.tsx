import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Badge, Box, Divider, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import SettingsIcon from '@mui/icons-material/Settings'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { layout, radius, shadows } from '@/theme/tokens'
import type { AuthUser } from '@/types/auth'

interface HeaderProps {
  onMenuClick: () => void
  currentUser: AuthUser
  notificationCount?: number
}

export function Header({ onMenuClick, currentUser, notificationCount = 4 }: HeaderProps) {
  const navigate = useNavigate()
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null)
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
          px: 2.5,
          backgroundColor: 'background.paper',
          borderRadius: `${radius.xl}px`,
          boxShadow: shadows.card,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton onClick={onMenuClick} edge="start" sx={{ mr: 1.5 }} aria-label="Toggle navigation">
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <IconButton onClick={toggleFullscreen} aria-label="Toggle fullscreen" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>

          <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} aria-label="Notifications">
            <Badge badgeContent={notificationCount} color="secondary">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notifAnchor}
            open={!!notifAnchor}
            onClose={() => setNotifAnchor(null)}
            slotProps={{ paper: { sx: { width: 320, borderRadius: `${radius.lg}px`, mt: 1 } } }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Notifications</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => setNotifAnchor(null)} sx={{ whiteSpace: 'normal', py: 1.25 }}>
              <Typography variant="body1">3 new approval requests are awaiting review.</Typography>
            </MenuItem>
            <MenuItem onClick={() => setNotifAnchor(null)} sx={{ whiteSpace: 'normal', py: 1.25 }}>
              <Typography variant="body1">Factory inventory upload completed successfully.</Typography>
            </MenuItem>
          </Menu>

          <IconButton onClick={() => navigate('/settings/general')} aria-label="Settings">
            <SettingsIcon />
          </IconButton>

          <Stack
            direction="row"
            spacing={1}
            onClick={(e) => setProfileAnchor(e.currentTarget)}
            sx={{
              alignItems: 'center',
              cursor: 'pointer',
              pl: 1,
              py: 0.5,
              pr: 0.5,
              ml: 0.5,
              borderRadius: `${radius.md}px`,
              transition: 'background-color 150ms',
              '&:hover': { backgroundColor: 'background.default' },
            }}
          >
            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontWeight: 700 }}>
              {currentUser.avatarInitial}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {currentUser.name}
              </Typography>
              <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                {currentUser.role.replace('_', ' ')}
              </Typography>
            </Box>
            <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </Stack>

          <Menu
            anchorEl={profileAnchor}
            open={!!profileAnchor}
            onClose={() => setProfileAnchor(null)}
            slotProps={{ paper: { sx: { borderRadius: `${radius.lg}px`, mt: 1 } } }}
          >
            <MenuItem
              onClick={() => {
                setProfileAnchor(null)
                navigate('/settings/profile')
              }}
            >
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                setProfileAnchor(null)
                navigate('/logout')
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </Box>
  )
}
