import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { Sidebar } from '@/components/layout/Sidebar/Sidebar'
import { Header } from '@/components/layout/Header/Header'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs/Breadcrumbs'
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQueryBreakpoint'
import { currentUser } from '@/features/auth/mockCurrentUser'

export function DashboardLayout() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  const sidebarVariant = isMobile
    ? 'temporary'
    : isTablet || desktopCollapsed
      ? 'rail'
      : 'permanent'

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev)
    } else if (!isTablet) {
      setDesktopCollapsed((prev) => !prev)
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        variant={sidebarVariant}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Header onMenuClick={handleMenuClick} currentUser={currentUser} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: 'background.default',
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <Breadcrumbs />
          </Box>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
