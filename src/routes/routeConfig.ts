import type { UserRole } from '@/types/auth'
import { menuConfig, type MenuItem } from '@/components/layout/Sidebar/menuConfig'

export interface RouteEntry {
  path: string
  breadcrumbLabel: string
  requiredRoles?: UserRole[]
  /** True when field-level requirements are not yet specified upstream. */
  pending?: boolean
  /** Opts this listing page into the global RegionTopbar rendered by DashboardLayout. */
  showRegionTopbar?: boolean
}

/** Paths intentionally left with placeholder data models pending real requirements. */
const PENDING_PATHS = new Set<string>([
  '/inventory/delivery-upload',
  '/masters/regions',
  '/masters/product-categories',
  '/settings/general',
  '/settings/notifications',
  '/settings/authentication',
  '/settings/profile',
])

function flattenItems(items: MenuItem[]): RouteEntry[] {
  const entries: RouteEntry[] = []
  for (const item of items) {
    if (item.path) {
      entries.push({
        path: item.path,
        breadcrumbLabel: item.label,
        pending: PENDING_PATHS.has(item.path),
        showRegionTopbar: item.showRegionTopbar,
      })
    }
    if (item.children) {
      entries.push(...flattenItems(item.children))
    }
  }
  return entries
}

/** Reachable only via the Header (Settings gear, profile menu) — intentionally not in the sidebar. */
export const headerOnlyRouteEntries: RouteEntry[] = [
  { path: '/settings/general', breadcrumbLabel: 'General Settings', pending: true },
  { path: '/settings/notifications', breadcrumbLabel: 'Notification Settings', pending: true },
  { path: '/settings/authentication', breadcrumbLabel: 'Authentication Settings', pending: true },
  { path: '/settings/profile', breadcrumbLabel: 'Profile', pending: true },
  { path: '/logout', breadcrumbLabel: 'Logout' },
]

export const routeEntries: RouteEntry[] = [
  ...menuConfig.flatMap((group) => flattenItems(group.items)),
  ...headerOnlyRouteEntries,
]

export function findRouteEntry(pathname: string): RouteEntry | undefined {
  return routeEntries.find((entry) => entry.path === pathname)
}

/** Detail routes nested under a list route, e.g. /partners/dealers/:id -> parent /partners/dealers. */
export interface DetailRouteConfig {
  parentPath: string
  resolveEntityName: (id: string) => string | undefined
}

const detailRouteConfigs: DetailRouteConfig[] = []

export function registerDetailRoute(config: DetailRouteConfig) {
  detailRouteConfigs.push(config)
}

export function findParentRouteEntry(pathname: string): { parent: RouteEntry; entityName?: string } | undefined {
  for (const config of detailRouteConfigs) {
    if (!pathname.startsWith(`${config.parentPath}/`)) continue
    const parent = findRouteEntry(config.parentPath)
    if (!parent) continue

    const remainder = pathname.slice(config.parentPath.length + 1)
    if (remainder === 'new') {
      return { parent, entityName: 'Add New' }
    }
    if (remainder.endsWith('/edit')) {
      const id = remainder.slice(0, -'/edit'.length)
      return { parent, entityName: `Edit ${config.resolveEntityName(id) ?? ''}`.trim() }
    }
    return { parent, entityName: config.resolveEntityName(remainder) }
  }
  return undefined
}
