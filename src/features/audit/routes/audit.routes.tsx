import type { RouteObject } from 'react-router-dom'
import { MasterScanLogListPage } from '@/features/audit/pages/MasterScanLogListPage'
import { MasterScanLogDetailsPage } from '@/features/audit/pages/MasterScanLogDetailsPage'
import { AuditLogListPage } from '@/features/audit/pages/AuditLogListPage'
import { AuditLogDetailsPage } from '@/features/audit/pages/AuditLogDetailsPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
export const auditRoutes: RouteObject[] = [
  { path: '/audit/master-scan-table-logs', element: <MasterScanLogListPage /> },
  { path: '/audit/master-scan-table-logs/:logId', element: <MasterScanLogDetailsPage /> },
  { path: '/audit/audit-logs', element: <AuditLogListPage /> },
  { path: '/audit/audit-logs/:logId', element: <AuditLogDetailsPage /> },
]
