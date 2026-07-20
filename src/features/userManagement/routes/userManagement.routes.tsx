import type { RouteObject } from 'react-router-dom'
import { DealerListPage } from '@/features/userManagement/pages/DealerListPage'
import { DealerDetailsPage } from '@/features/userManagement/pages/DealerDetailsPage'
import { DealerFormPage } from '@/features/userManagement/pages/DealerFormPage'
import { ApprovalRequestsListPage } from '@/features/userManagement/pages/ApprovalRequestsListPage'
import { ApprovalRequestDetailsPage } from '@/features/userManagement/pages/ApprovalRequestDetailsPage'
import { RejectedRequestsListPage } from '@/features/userManagement/pages/RejectedRequestsListPage'
import { RejectedRequestDetailsPage } from '@/features/userManagement/pages/RejectedRequestDetailsPage'
// Chemists is an existing sibling feature (src/features/chemists) — reused via
// chemistRoutes, not duplicated here. Register both under the `/partners/*`
// path family alongside these dealer routes.
import { chemistRoutes } from '@/features/chemists/routes/chemist.routes'

// Register under <ProtectedRoute /> + <DashboardLayout />.
export const partnersRoutes: RouteObject[] = [
  { path: '/partners/dealers', element: <DealerListPage /> },
  { path: '/partners/dealers/new', element: <DealerFormPage /> },
  { path: '/partners/dealers/:dealerId', element: <DealerDetailsPage /> },
  { path: '/partners/dealers/:dealerId/edit', element: <DealerFormPage /> },
  ...chemistRoutes,
]

export const verificationRoutes: RouteObject[] = [
  { path: '/verification/approval-requests', element: <ApprovalRequestsListPage /> },
  { path: '/verification/approval-requests/:requestId', element: <ApprovalRequestDetailsPage /> },
  { path: '/verification/rejected-requests', element: <RejectedRequestsListPage /> },
  { path: '/verification/rejected-requests/:requestId', element: <RejectedRequestDetailsPage /> },
]

export const userManagementRoutes: RouteObject[] = [...partnersRoutes, ...verificationRoutes]
