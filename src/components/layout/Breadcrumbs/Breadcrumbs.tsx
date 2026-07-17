import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material'
import { ChevronRight } from 'lucide-react'
import { findParentRouteEntry, findRouteEntry } from '@/routes/routeConfig'

export function Breadcrumbs() {
  const location = useLocation()
  const entry = findRouteEntry(location.pathname)
  const detail = entry ? undefined : findParentRouteEntry(location.pathname)

  // Routes 3+ levels deep (e.g. container/box drill-down pages) render their own
  // complete breadcrumb trail locally, so skip the global one entirely to avoid
  // a stacked/duplicate trail.
  if (!entry && !detail) return null

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
    <MuiBreadcrumbs separator={<ChevronRight size={20} />} sx={{ fontSize: '0.8rem' }}>
      <Link component={RouterLink} to="/dashboard" underline="hover" color="text.secondary">
        Home
      </Link>
      {trailingCrumbs}
    </MuiBreadcrumbs>
  )
}
