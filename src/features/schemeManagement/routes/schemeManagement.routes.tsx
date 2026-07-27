import type { RouteObject } from 'react-router-dom'
import { SchemesListPage } from '@/features/schemeManagement/pages/SchemesListPage'
import { SchemeDetailsPage } from '@/features/schemeManagement/pages/SchemeDetailsPage'
import { SchemeFormPage } from '@/features/schemeManagement/pages/SchemeFormPage'
import { GiftCatalogueListPage } from '@/features/schemeManagement/pages/GiftCatalogueListPage'
import { GiftDetailsPage } from '@/features/schemeManagement/pages/GiftDetailsPage'
import { GiftFormPage } from '@/features/schemeManagement/pages/GiftFormPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
export const schemeManagementRoutes: RouteObject[] = [
  { path: '/scheme-management/schemes', element: <SchemesListPage /> },
  { path: '/scheme-management/schemes/new', element: <SchemeFormPage /> },
  { path: '/scheme-management/schemes/:schemeId', element: <SchemeDetailsPage /> },
  { path: '/scheme-management/schemes/:schemeId/edit', element: <SchemeFormPage /> },
  { path: '/scheme-management/gift-catalogue', element: <GiftCatalogueListPage /> },
  { path: '/scheme-management/gift-catalogue/new', element: <GiftFormPage /> },
  { path: '/scheme-management/gift-catalogue/:giftId', element: <GiftDetailsPage /> },
  { path: '/scheme-management/gift-catalogue/:giftId/edit', element: <GiftFormPage /> },
]
