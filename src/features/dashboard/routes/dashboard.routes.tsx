import type { RouteObject } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

// Register under <ProtectedRoute /> + <DashboardLayout />, same nesting level
// as the existing `/dashboard` route in app/router/AppRouter.tsx.
export const dashboardRoutes: RouteObject[] = [{ path: '/dashboard', element: <DashboardPage /> }]
