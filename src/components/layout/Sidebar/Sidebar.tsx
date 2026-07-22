import { Box, Divider, Drawer } from '@mui/material'
import { Link } from 'react-router-dom'
import { menuConfig } from '@/components/layout/Sidebar/menuConfig'
import { SidebarGroup } from '@/components/layout/Sidebar/SidebarGroup'
import { UserFooterCard } from '@/components/layout/Sidebar/UserFooterCard'
import {
  sidebarPalettes,
  type SidebarPalette,
} from '@/components/layout/Sidebar/sidebarPalettes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAppearance } from '@/contexts/AppearanceContext'
import { useAppSelector } from '@/app/store/hooks'
import { selectUnreadNotificationCount } from '@/features/notifications/slices/notificationsSelectors'
import { layout, radius, shadows } from '@/theme/tokens'

interface SidebarProps {
  variant: 'permanent' | 'rail' | 'temporary'
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function SidebarBrand({
  railMode,
  palette,
}: {
  railMode: boolean
  palette: SidebarPalette
}) {
  return (
    <Box
      component={Link}
      to="/dashboard"
      data-testid="sidebar-brand"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginY: 1,

        // height: layout.headerHeight,
        height: layout.headerHeight,
      }}
    >
      <Box
        component="img"
        src={railMode ? '/images/logo/logo-mark.png' : '/images/logo/logo.png'}
        alt={railMode ? 'MedTech logo icon' : 'MedTech logo'}
        sx={{
          width: railMode ? 30 : '90%',
          height: railMode ? 56 : '100%',
          objectFit: 'contain',
          display: 'block',
          filter:
            palette.brandLogo === 'invert' ? 'brightness(0) invert(1)' : 'none',
        }}
      />
    </Box>
  )
}

function SidebarContent({
  railMode,
  palette,
}: {
  railMode: boolean
  palette: SidebarPalette
}) {
  const { user } = useAuth()
  const unreadNotificationCount = useAppSelector(selectUnreadNotificationCount)
  const badgeOverrides = { '/notifications': unreadNotificationCount }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <SidebarBrand railMode={railMode} palette={palette} />
      <Divider sx={{ borderColor: palette.divider }} />
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          py: 1,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {menuConfig.map((group, index) => (
          <Box key={group.groupLabel}>
            <SidebarGroup group={group} railMode={railMode} palette={palette} badgeOverrides={badgeOverrides} />
            {index < menuConfig.length - 1 && (
              <Divider sx={{ borderColor: palette.divider, mx: 2, my: 0.5 }} />
            )}
          </Box>
        ))}
      </Box>
      <Divider sx={{ borderColor: palette.divider }} />
      {user && <UserFooterCard user={user} railMode={railMode} palette={palette} />}
    </Box>
  )
}

export function Sidebar({
  variant,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const { sidebarVariant } = useAppearance()
  const palette = sidebarPalettes[sidebarVariant]

  if (variant === 'temporary') {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 10,
          '& .MuiDrawer-paper': {
            width: layout.sidebarWidth,
            boxSizing: 'border-box',
            backgroundColor: palette.background,
          },
        }}
      >
        <SidebarContent railMode={false} palette={palette} />
      </Drawer>
    )
  }

  const width =
    variant === 'rail' ? layout.sidebarRailWidth : layout.sidebarWidth
  const gutter = 16

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: width + gutter,
        flexShrink: 0,
        border: 'none',
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          top: gutter,
          left: gutter,
          height: `calc(100% - ${gutter * 2}px)`,
          border: 'none',
          borderRadius: `${radius.xl}px`,
          boxShadow: shadows.card,
          backgroundColor: palette.background,
          transition: 'width 0.2s ease, background-color 0.2s ease',
        },
      }}
    >
      <SidebarContent railMode={variant === 'rail'} palette={palette} />
    </Drawer>
  )
}
