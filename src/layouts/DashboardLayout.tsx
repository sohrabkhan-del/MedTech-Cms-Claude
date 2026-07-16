import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import { Sidebar } from '@/components/layout/Sidebar/Sidebar'
import { Header } from '@/components/layout/Header/Header'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs/Breadcrumbs'
import { RegionTopbar } from '@/components/common/RegionTopbar/RegionTopbar'
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQueryBreakpoint'
import { findRouteEntry } from '@/routes/routeConfig'
import {
  RegionFilterProvider,
  useRegionFilter,
} from '@/contexts/RegionFilterContext'

function GlobalRegionTopbar() {
  const location = useLocation()
  const { region, setRegion, dateRange, setDateRange, header } =
    useRegionFilter()

  const showTopbar =
    findRouteEntry(location.pathname)?.showRegionTopbar === true
  if (!showTopbar || !header) return null

  return (
    <RegionTopbar
      icon={header.icon}
      title={header.title}
      subtitle={header.subtitle}
      live={header.live}
      region={region}
      onRegionChange={setRegion}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
    />
  )
}

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
    <RegionFilterProvider>
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
          <Header onMenuClick={handleMenuClick} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              backgroundColor: 'background.default',
              px: { xs: 2, sm: 3 },
              pb: { xs: 2, sm: 3 },
            }}
          >
            <Box
              sx={{
                mb: 1,
                paddingX: { xs: 0, sm: 1 },
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <Breadcrumbs />
            </Box>
            <GlobalRegionTopbar />
            <Outlet />
          </Box>
        </Box>
      </Box>
    </RegionFilterProvider>
  )
}
