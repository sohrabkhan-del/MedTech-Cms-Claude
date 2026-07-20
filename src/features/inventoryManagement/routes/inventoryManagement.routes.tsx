import type { RouteObject } from 'react-router-dom'
import { ProductListPage } from '@/features/inventoryManagement/pages/ProductListPage'
import { ProductDetailsPage } from '@/features/inventoryManagement/pages/ProductDetailsPage'
import { ProductFormPage } from '@/features/inventoryManagement/pages/ProductFormPage'
import { FactoryUploadListPage } from '@/features/inventoryManagement/pages/FactoryUploadListPage'
import { FactoryUploadFormPage } from '@/features/inventoryManagement/pages/FactoryUploadFormPage'
import { FactoryUploadDetailsPage } from '@/features/inventoryManagement/pages/FactoryUploadDetailsPage'
import { FactoryContainerPage } from '@/features/inventoryManagement/pages/FactoryContainerPage'
import { FactoryBoxPage } from '@/features/inventoryManagement/pages/FactoryBoxPage'
import { ProductBatchesPage } from '@/features/inventoryManagement/pages/ProductBatchesPage'
import { ProductionBatchDetailsPage } from '@/features/inventoryManagement/pages/ProductionBatchDetailsPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
export const inventoryManagementRoutes: RouteObject[] = [
  { path: '/inventory/product-master', element: <ProductListPage /> },
  { path: '/inventory/product-master/new', element: <ProductFormPage /> },
  { path: '/inventory/product-master/:productId', element: <ProductDetailsPage /> },
  { path: '/inventory/product-master/:productId/edit', element: <ProductFormPage /> },
  { path: '/inventory/factory-inventory-upload', element: <FactoryUploadListPage /> },
  { path: '/inventory/factory-inventory-upload/new', element: <FactoryUploadFormPage /> },
  { path: '/inventory/factory-inventory-upload/:batchId', element: <FactoryUploadDetailsPage /> },
  { path: '/inventory/factory-inventory-upload/:batchId/:containerId', element: <FactoryContainerPage /> },
  { path: '/inventory/factory-inventory-upload/:batchId/:containerId/:boxId', element: <FactoryBoxPage /> },
  { path: '/inventory/product-batches', element: <ProductBatchesPage /> },
  { path: '/inventory/product-batches/:batchId', element: <ProductionBatchDetailsPage /> },
  // NOTE: no dedicated "Delivery Upload" page exists yet (see FactoryUploadFormPage,
  // which is currently the closest equivalent). This route is a placeholder alias
  // pointing at the same form — replace with a real page once scoped.
  { path: '/inventory/delivery-upload', element: <FactoryUploadFormPage /> },
]
