import type { RouteObject } from 'react-router-dom'
import { AdminListPage } from '@/features/systemUsers/pages/AdminListPage'
import { AdminDetailsPage } from '@/features/systemUsers/pages/AdminDetailsPage'
import { AdminFormPage } from '@/features/systemUsers/pages/AdminFormPage'
import { MedicalRepListPage } from '@/features/systemUsers/pages/MedicalRepListPage'
import { MedicalRepDetailsPage } from '@/features/systemUsers/pages/MedicalRepDetailsPage'
import { MedicalRepFormPage } from '@/features/systemUsers/pages/MedicalRepFormPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
export const systemUsersRoutes: RouteObject[] = [
  { path: '/system-users/admin', element: <AdminListPage /> },
  { path: '/system-users/admin/new', element: <AdminFormPage /> },
  { path: '/system-users/admin/:adminId', element: <AdminDetailsPage /> },
  { path: '/system-users/admin/:adminId/edit', element: <AdminFormPage /> },
  { path: '/system-users/medical-representatives', element: <MedicalRepListPage /> },
  { path: '/system-users/medical-representatives/new', element: <MedicalRepFormPage /> },
  { path: '/system-users/medical-representatives/:mrId', element: <MedicalRepDetailsPage /> },
  { path: '/system-users/medical-representatives/:mrId/edit', element: <MedicalRepFormPage /> },
]
