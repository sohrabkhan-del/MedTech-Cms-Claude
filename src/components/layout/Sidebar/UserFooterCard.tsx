import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Box, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { ChevronRight as ChevronRightIcon, Settings as SettingsOutlinedIcon, User as PersonOutlineIcon, LogOut as LogoutIcon } from 'lucide-react'
import { sidebarPalettes, type SidebarPalette } from '@/components/layout/Sidebar/sidebarPalettes'
import { radius } from '@/theme/tokens'
import type { AuthUser } from '@/types/auth'

interface UserFooterCardProps {
  user: AuthUser
  railMode: boolean
  palette?: SidebarPalette
}

export function UserFooterCard({ user, railMode, palette = sidebarPalettes.light }: UserFooterCardProps) {
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
          '&:hover': { backgroundColor: palette.hoverBackground },
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
                borderColor: palette.background,
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
              overflow: 'hidden',
              backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!user.avatarUrl && user.avatarInitial}
          </Box>
        </Badge>
        {!railMode && (
          <>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.2, color: palette.textPrimary }} noWrap>
                {user.name}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: palette.textSecondary }} noWrap>
                {user.role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Typography>
            </Box>
            <ChevronRightIcon size={18} style={{ color: palette.textDisabled }} />
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
          <Box component="span" sx={{ display: 'inline-flex', mr: 1.5, color: 'text.secondary' }}>
            <PersonOutlineIcon size={20} />
          </Box>
          Profile
        </MenuItem>
        <MenuItem onClick={() => goTo('/settings/general')}>
          <Box component="span" sx={{ display: 'inline-flex', mr: 1.5, color: 'text.secondary' }}>
            <SettingsOutlinedIcon size={20} />
          </Box>
          Settings
        </MenuItem>
        <MenuItem onClick={() => goTo('/logout')} sx={{ color: 'error.main' }}>
          <Box component="span" sx={{ display: 'inline-flex', mr: 1.5 }}>
            <LogoutIcon size={20} />
          </Box>
          Logout
        </MenuItem>
      </Menu>
    </>
  )
}
