import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { findParentRouteEntry, findRouteEntry } from '@/routes/routeConfig'

export function Breadcrumbs() {
  const location = useLocation()
  const entry = findRouteEntry(location.pathname)
  const detail = entry ? undefined : findParentRouteEntry(location.pathname)

  const trailingCrumbs = detail
    ? [
        <Link key="parent" component={RouterLink} to={detail.parent.path} underline="hover" color="text.secondary">
          {detail.parent.breadcrumbLabel}
        </Link>,
        <Typography key="entity" color="text.primary" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
          {detail.entityName ?? ''}
        </Typography>,
      ]
    : [
        <Typography key="current" color="text.primary" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
          {entry?.breadcrumbLabel ?? ''}
        </Typography>,
      ]

  return (
    <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ fontSize: '0.8rem' }}>
      <Link component={RouterLink} to="/dashboard" underline="hover" color="text.secondary">
        Home
      </Link>
      {trailingCrumbs}
    </MuiBreadcrumbs>
  )
}
