import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Box, Menu, MenuItem, Stack, Typography } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import { radius } from '@/theme/tokens'
import type { AuthUser } from '@/types/auth'

interface UserFooterCardProps {
  user: AuthUser
  railMode: boolean
}

export function UserFooterCard({ user, railMode }: UserFooterCardProps) {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const goTo = (path: string) => {
    setAnchorEl(null)
    navigate(path)
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={1.25}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          alignItems: 'center',
          justifyContent: railMode ? 'center' : 'flex-start',
          px: railMode ? 1 : 2,
          py: 1.5,
          cursor: 'pointer',
          transition: 'background-color 150ms',
          '&:hover': { backgroundColor: 'background.default' },
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            />
          }
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'secondary.main',
              color: 'secondary.contrastText',
              fontWeight: 700,
              fontSize: '0.8rem',
              flexShrink: 0,
            }}
          >
            {user.avatarInitial}
          </Box>
        </Badge>
        {!railMode && (
          <>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.2 }} noWrap>
                {user.name}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }} noWrap>
                {user.role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Typography>
            </Box>
            <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
          </>
        )}
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: railMode ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: railMode ? 'left' : 'left' }}
        slotProps={{ paper: { sx: { minWidth: 200, borderRadius: `${radius.lg}px` } } }}
      >
        <MenuItem onClick={() => goTo('/settings/profile')}>
          <PersonOutlineIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => goTo('/settings/general')}>
          <SettingsOutlinedIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
          Settings
        </MenuItem>
        <MenuItem onClick={() => goTo('/logout')} sx={{ color: 'error.main' }}>
          <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  )
}
