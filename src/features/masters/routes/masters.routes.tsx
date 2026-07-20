import type { RouteObject } from 'react-router-dom'
import { ProductCategoryListPage } from '@/features/masters/pages/ProductCategoryListPage'
import { ProductCategoryDetailsPage } from '@/features/masters/pages/ProductCategoryDetailsPage'
import { ProductCategoryFormPage } from '@/features/masters/pages/ProductCategoryFormPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
export const mastersRoutes: RouteObject[] = [
  { path: '/masters/product-categories', element: <ProductCategoryListPage /> },
  { path: '/masters/product-categories/new', element: <ProductCategoryFormPage /> },
  { path: '/masters/product-categories/:categoryId', element: <ProductCategoryDetailsPage /> },
  { path: '/masters/product-categories/:categoryId/edit', element: <ProductCategoryFormPage /> },
]
