import type { RouteObject } from 'react-router-dom'
import { GeneralSchemesListPage } from '@/features/schemeManagement/pages/GeneralSchemesListPage'
import { SeasonalSchemesListPage } from '@/features/schemeManagement/pages/SeasonalSchemesListPage'
import { SchemeDetailsPage } from '@/features/schemeManagement/pages/SchemeDetailsPage'
import { SchemeFormPage } from '@/features/schemeManagement/pages/SchemeFormPage'
import { GiftCatalogueListPage } from '@/features/schemeManagement/pages/GiftCatalogueListPage'
import { GiftDetailsPage } from '@/features/schemeManagement/pages/GiftDetailsPage'
import { GiftFormPage } from '@/features/schemeManagement/pages/GiftFormPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
export const schemeManagementRoutes: RouteObject[] = [
  { path: '/scheme-management/schemes/general', element: <GeneralSchemesListPage /> },
  { path: '/scheme-management/schemes/sessional', element: <SeasonalSchemesListPage /> },
  { path: '/scheme-management/schemes/:category/new', element: <SchemeFormPage /> },
  { path: '/scheme-management/schemes/:category/:schemeId', element: <SchemeDetailsPage /> },
  { path: '/scheme-management/schemes/:category/:schemeId/edit', element: <SchemeFormPage /> },
  { path: '/scheme-management/gift-catalogue', element: <GiftCatalogueListPage /> },
  { path: '/scheme-management/gift-catalogue/new', element: <GiftFormPage /> },
  { path: '/scheme-management/gift-catalogue/:giftId', element: <GiftDetailsPage /> },
  { path: '/scheme-management/gift-catalogue/:giftId/edit', element: <GiftFormPage /> },
]
