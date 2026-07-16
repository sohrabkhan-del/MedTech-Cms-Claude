import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { DealerListPage } from '@/pages/dealers/DealerListPage'
import { DealerDetailsPage } from '@/pages/dealers/DealerDetailsPage'
import { DealerFormPage } from '@/pages/dealers/DealerFormPage'
import { ChemistListPage } from '@/pages/chemists/ChemistListPage'
import { ChemistDetailsPage } from '@/pages/chemists/ChemistDetailsPage'
import { ChemistFormPage } from '@/pages/chemists/ChemistFormPage'
import { LiveScanFeedPage } from '@/pages/fieldOperations/LiveScanFeedPage'
import { SecurityAlertsPage } from '@/pages/fieldOperations/SecurityAlertsPage'
import { GeoFenceListPage } from '@/pages/fieldOperations/GeoFenceListPage'
import { GeoFenceDetailsPage } from '@/pages/fieldOperations/GeoFenceDetailsPage'
import { GeoFenceFormPage } from '@/pages/fieldOperations/GeoFenceFormPage'
import { ApprovalRequestsListPage } from '@/pages/verification/ApprovalRequestsListPage'
import { ApprovalRequestDetailsPage } from '@/pages/verification/ApprovalRequestDetailsPage'
import { RejectedRequestsListPage } from '@/pages/verification/RejectedRequestsListPage'
import { RejectedRequestDetailsPage } from '@/pages/verification/RejectedRequestDetailsPage'
import { ProductListPage } from '@/pages/inventory/ProductListPage'
import { ProductDetailsPage } from '@/pages/inventory/ProductDetailsPage'
import { ProductFormPage } from '@/pages/inventory/ProductFormPage'
import { AppearanceSettingsPage } from '@/pages/settings/AppearanceSettingsPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { routeEntries, registerDetailRoute } from '@/routes/routeConfig'
import { getDealerById } from '@/features/dealers/mockDealers'
import { getChemistById } from '@/features/chemists/mockChemists'
import { getGeoFenceById } from '@/features/fieldOperations/mockGeoFences'
import { getApprovalRequestById } from '@/features/verification/mockApprovalRequests'
import { getProductById } from '@/features/inventory/mockProducts'

const CUSTOM_PATHS = new Set([
  '/dashboard',
  '/partners/dealers',
  '/partners/chemists',
  '/field-operations/live-scan-feed',
  '/field-operations/security-alerts',
  '/field-operations/geo-fence-management',
  '/verification/approval-requests',
  '/verification/rejected-requests',
  '/inventory/product-master',
  '/settings/general',
])

registerDetailRoute({
  parentPath: '/partners/dealers',
  resolveEntityName: (id) => getDealerById(id)?.shopName,
})
registerDetailRoute({
  parentPath: '/partners/chemists',
  resolveEntityName: (id) => getChemistById(id)?.shopName,
})
registerDetailRoute({
  parentPath: '/field-operations/geo-fence-management',
  resolveEntityName: (id) => getGeoFenceById(id)?.userName,
})
registerDetailRoute({
  parentPath: '/verification/approval-requests',
  resolveEntityName: (id) => getApprovalRequestById(id)?.applicantName,
})
registerDetailRoute({
  parentPath: '/verification/rejected-requests',
  resolveEntityName: (id) => getApprovalRequestById(id)?.applicantName,
})
registerDetailRoute({
  parentPath: '/inventory/product-master',
  resolveEntityName: (id) => getProductById(id)?.productName,
})

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/field-operations/live-scan-feed" element={<LiveScanFeedPage />} />
        <Route path="/field-operations/security-alerts" element={<SecurityAlertsPage />} />
        <Route path="/field-operations/geo-fence-management" element={<GeoFenceListPage />} />
        <Route path="/field-operations/geo-fence-management/new" element={<GeoFenceFormPage />} />
        <Route path="/field-operations/geo-fence-management/:fenceId" element={<GeoFenceDetailsPage />} />
        <Route path="/field-operations/geo-fence-management/:fenceId/edit" element={<GeoFenceFormPage />} />
        <Route path="/partners/dealers" element={<DealerListPage />} />
        <Route path="/partners/dealers/new" element={<DealerFormPage />} />
        <Route path="/partners/dealers/:dealerId" element={<DealerDetailsPage />} />
        <Route path="/partners/dealers/:dealerId/edit" element={<DealerFormPage />} />
        <Route path="/partners/chemists" element={<ChemistListPage />} />
        <Route path="/partners/chemists/new" element={<ChemistFormPage />} />
        <Route path="/partners/chemists/:chemistId" element={<ChemistDetailsPage />} />
        <Route path="/partners/chemists/:chemistId/edit" element={<ChemistFormPage />} />
        <Route path="/verification/approval-requests" element={<ApprovalRequestsListPage />} />
        <Route path="/verification/approval-requests/:requestId" element={<ApprovalRequestDetailsPage />} />
        <Route path="/verification/rejected-requests" element={<RejectedRequestsListPage />} />
        <Route path="/verification/rejected-requests/:requestId" element={<RejectedRequestDetailsPage />} />
        <Route path="/inventory/product-master" element={<ProductListPage />} />
        <Route path="/inventory/product-master/new" element={<ProductFormPage />} />
        <Route path="/inventory/product-master/:productId" element={<ProductDetailsPage />} />
        <Route path="/inventory/product-master/:productId/edit" element={<ProductFormPage />} />
        <Route path="/settings/general" element={<AppearanceSettingsPage />} />
        {routeEntries
          .filter((entry) => !CUSTOM_PATHS.has(entry.path))
          .map((entry) => (
            <Route
              key={entry.path}
              path={entry.path}
              element={<PlaceholderPage title={entry.breadcrumbLabel} pending={entry.pending} />}
            />
          ))}
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
