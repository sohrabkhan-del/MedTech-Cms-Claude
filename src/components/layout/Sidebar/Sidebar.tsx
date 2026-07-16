import { Box, Divider, Drawer, List, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { menuConfig } from '@/components/layout/Sidebar/menuConfig'
import { SidebarItem } from '@/components/layout/Sidebar/SidebarItem'
import { UserFooterCard } from '@/components/layout/Sidebar/UserFooterCard'
import { currentUser } from '@/features/auth/mockCurrentUser'
import { layout, radius, shadows } from '@/theme/tokens'

interface SidebarProps {
  variant: 'permanent' | 'rail' | 'temporary'
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function SidebarBrand({ railMode }: { railMode: boolean }) {
  return (
    <Box
      component={Link}
      to="/dashboard"
      data-testid="sidebar-brand"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: layout.headerHeight,
        // px: railMode ? 1 : 2,
      }}
    >
      <Box
        component="img"
        src={railMode ? '/images/logo/logo-mark.png' : '/images/logo/logo.png'}
        alt={railMode ? 'MedTech logo icon' : 'MedTech logo'}
        sx={{
          width: railMode ? 30 : '90%',
          height: railMode ? 56 : '90%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  )
}

function SidebarContent({ railMode }: { railMode: boolean }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <SidebarBrand railMode={railMode} />
      <Divider />
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        {menuConfig.map((group) => (
          <Box key={group.groupLabel} sx={{ mb: 0.5 }}>
            {!railMode && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  px: 2.5,
                  pt: 1.25,
                  pb: 0.375,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  fontSize: '0.6rem',
                }}
              >
                {group.groupLabel}
              </Typography>
            )}
            <List disablePadding>
              {group.items.map((item) => (
                <SidebarItem
                  key={item.path ?? item.label}
                  item={item}
                  railMode={railMode}
                />
              ))}
            </List>
          </Box>
        ))}
      </Box>
      <Divider />
      <UserFooterCard user={currentUser} railMode={railMode} />
    </Box>
  )
}

export function Sidebar({
  variant,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
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
            backgroundColor: 'background.paper',
          },
        }}
      >
        <SidebarContent railMode={false} />
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
          backgroundColor: 'background.paper',
          transition: 'width 0.2s ease',
        },
      }}
    >
      <SidebarContent railMode={variant === 'rail'} />
    </Drawer>
  )
}
