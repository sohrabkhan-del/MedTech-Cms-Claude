import type { RouteObject } from 'react-router-dom'
import { DealerListPage } from '@/features/userManagement/pages/DealerListPage'
import { DealerDetailsPage } from '@/features/userManagement/pages/DealerDetailsPage'
import { DealerFormPage } from '@/features/userManagement/pages/DealerFormPage'
import { ApprovalRequestsListPage } from '@/features/userManagement/pages/ApprovalRequestsListPage'
import { ApprovalRequestDetailsPage } from '@/features/userManagement/pages/ApprovalRequestDetailsPage'
import { RejectedRequestsListPage } from '@/features/userManagement/pages/RejectedRequestsListPage'
import { RejectedRequestDetailsPage } from '@/features/userManagement/pages/RejectedRequestDetailsPage'
import { ChemistListPage } from '@/features/userManagement/pages/ChemistListPage'
import { ChemistDetailsPage } from '@/features/userManagement/pages/ChemistDetailsPage'
import { ChemistFormPage } from '@/features/userManagement/pages/ChemistFormPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
export const partnersRoutes: RouteObject[] = [
  { path: '/partners/dealers', element: <DealerListPage /> },
  { path: '/partners/dealers/new', element: <DealerFormPage /> },
  { path: '/partners/dealers/:dealerId', element: <DealerDetailsPage /> },
  { path: '/partners/dealers/:dealerId/edit', element: <DealerFormPage /> },
  { path: '/partners/chemists', element: <ChemistListPage /> },
  { path: '/partners/chemists/new', element: <ChemistFormPage /> },
  { path: '/partners/chemists/:chemistId', element: <ChemistDetailsPage /> },
  { path: '/partners/chemists/:chemistId/edit', element: <ChemistFormPage /> },
]

export const verificationRoutes: RouteObject[] = [
  { path: '/verification/approval-requests', element: <ApprovalRequestsListPage /> },
  { path: '/verification/approval-requests/:requestId', element: <ApprovalRequestDetailsPage /> },
  { path: '/verification/rejected-requests', element: <RejectedRequestsListPage /> },
  { path: '/verification/rejected-requests/:requestId', element: <RejectedRequestDetailsPage /> },
]

export const userManagementRoutes: RouteObject[] = [...partnersRoutes, ...verificationRoutes]
