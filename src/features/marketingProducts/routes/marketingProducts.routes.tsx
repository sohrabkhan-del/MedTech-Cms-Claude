import type { RouteObject } from 'react-router-dom'
import { ProductsCatalogPage } from '@/features/marketingProducts/pages/ProductsCatalogPage'
import { ProductCatalogDetailsPage } from '@/features/marketingProducts/pages/ProductCatalogDetailsPage'
import { ProductCatalogFormPage } from '@/features/marketingProducts/pages/ProductCatalogFormPage'
import { InterestedUsersPage } from '@/features/marketingProducts/pages/InterestedUsersPage'
import { InterestedUserDetailsPage } from '@/features/marketingProducts/pages/InterestedUserDetailsPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
export const marketingProductsRoutes: RouteObject[] = [
  { path: '/marketing-products/products-catelog', element: <ProductsCatalogPage /> },
  { path: '/marketing-products/products-catelog/new', element: <ProductCatalogFormPage /> },
  { path: '/marketing-products/products-catelog/:productId', element: <ProductCatalogDetailsPage /> },
  { path: '/marketing-products/products-catelog/:productId/edit', element: <ProductCatalogFormPage /> },
  { path: '/marketing-products/interested-users', element: <InterestedUsersPage /> },
  { path: '/marketing-products/interested-users/:leadId', element: <InterestedUserDetailsPage /> },
]
