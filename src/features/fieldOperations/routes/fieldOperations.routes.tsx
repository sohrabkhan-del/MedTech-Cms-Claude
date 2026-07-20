import type { RouteObject } from 'react-router-dom'
import { LiveScanFeedPage } from '@/features/fieldOperations/pages/LiveScanFeedPage'
import { SecurityAlertsPage } from '@/features/fieldOperations/pages/SecurityAlertsPage'
import { GeoFenceManagementPage } from '@/features/fieldOperations/pages/GeoFenceManagementPage'
import { GeoFenceDetailsPage } from '@/features/fieldOperations/pages/GeoFenceDetailsPage'
import { GeoFenceFormPage } from '@/features/fieldOperations/pages/GeoFenceFormPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
export const fieldOperationsRoutes: RouteObject[] = [
  { path: '/field-operations/live-scan-feed', element: <LiveScanFeedPage /> },
  { path: '/field-operations/security-alerts', element: <SecurityAlertsPage /> },
  { path: '/field-operations/geo-fence-management', element: <GeoFenceManagementPage /> },
  { path: '/field-operations/geo-fence-management/new', element: <GeoFenceFormPage /> },
  { path: '/field-operations/geo-fence-management/:fenceId', element: <GeoFenceDetailsPage /> },
  { path: '/field-operations/geo-fence-management/:fenceId/edit', element: <GeoFenceFormPage /> },
]
