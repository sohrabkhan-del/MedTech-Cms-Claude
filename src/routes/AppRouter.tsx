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
import { FactoryUploadListPage } from '@/pages/inventory/FactoryUploadListPage'
import { FactoryUploadFormPage } from '@/pages/inventory/FactoryUploadFormPage'
import { FactoryUploadDetailsPage } from '@/pages/inventory/FactoryUploadDetailsPage'
import { FactoryContainerPage } from '@/pages/inventory/FactoryContainerPage'
import { FactoryBoxPage } from '@/pages/inventory/FactoryBoxPage'
import { ProductBatchesPage } from '@/pages/inventory/ProductBatchesPage'
import { ProductionBatchDetailsPage } from '@/pages/inventory/ProductionBatchDetailsPage'
import { ProductsCatalogPage } from '@/pages/marketing/ProductsCatalogPage'
import { ProductCatalogDetailsPage } from '@/pages/marketing/ProductCatalogDetailsPage'
import { ProductCatalogFormPage } from '@/pages/marketing/ProductCatalogFormPage'
import { InterestedUsersPage } from '@/pages/marketing/InterestedUsersPage'
import { InterestedUserDetailsPage } from '@/pages/marketing/InterestedUserDetailsPage'
import { GeneralSchemesListPage } from '@/pages/schemes/GeneralSchemesListPage'
import { SeasonalSchemesListPage } from '@/pages/schemes/SeasonalSchemesListPage'
import { SchemeDetailsPage } from '@/pages/schemes/SchemeDetailsPage'
import { SchemeFormPage } from '@/pages/schemes/SchemeFormPage'
import { GiftCatalogueListPage } from '@/pages/schemes/GiftCatalogueListPage'
import { GiftDetailsPage } from '@/pages/schemes/GiftDetailsPage'
import { GiftFormPage } from '@/pages/schemes/GiftFormPage'
import { GiftRulesListPage } from '@/pages/schemes/GiftRulesListPage'
import { GiftRuleDetailsPage } from '@/pages/schemes/GiftRuleDetailsPage'
import { GiftRuleFormPage } from '@/pages/schemes/GiftRuleFormPage'
import { WalletListPage } from '@/pages/wallets/WalletListPage'
import { WalletDetailsPage } from '@/pages/wallets/WalletDetailsPage'
import { RedemptionListPage } from '@/pages/wallets/RedemptionListPage'
import { RedemptionDetailsPage } from '@/pages/wallets/RedemptionDetailsPage'
import { CoinValueRulesListPage } from '@/pages/wallets/CoinValueRulesListPage'
import { CoinValueRuleDetailsPage } from '@/pages/wallets/CoinValueRuleDetailsPage'
import { AppearanceSettingsPage } from '@/pages/settings/AppearanceSettingsPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { routeEntries, registerDetailRoute } from '@/routes/routeConfig'
import { getDealerById } from '@/features/dealers/mockDealers'
import { getChemistById } from '@/features/chemists/mockChemists'
import { getGeoFenceById } from '@/features/fieldOperations/mockGeoFences'
import { getApprovalRequestById } from '@/features/verification/mockApprovalRequests'
import { getProductById } from '@/features/inventory/mockProducts'
import { getBatchById } from '@/features/inventory/mockFactoryUploads'
import { getProductionBatchById } from '@/features/inventory/mockProductBatches'
import { getShowcaseProductById } from '@/features/marketing/mockShowcaseProducts'
import { getInterestedUserById } from '@/features/marketing/mockInterestedUsers'
import { getSchemeById } from '@/features/schemes/mockSchemes'
import { getGiftById } from '@/features/schemes/mockGifts'
import { getRewardRuleById } from '@/features/schemes/mockGiftRules'
import { getWalletById } from '@/features/wallets/mockWallets'
import { getRedemptionRequestById } from '@/features/wallets/mockRedemptions'
import { getCoinValueRuleById } from '@/features/wallets/mockCoinRules'

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
  '/inventory/factory-inventory-upload',
  '/inventory/product-batches',
  '/marketing-products/products-catelog',
  '/marketing-products/interested-users',
  '/scheme-management/schemes/general',
  '/scheme-management/schemes/sessional',
  '/scheme-management/gift-catalogue',
  '/scheme-management/gift-rules',
  '/rewards-wallet/wallet-management',
  '/rewards-wallet/reward-redemptions',
  '/rewards-wallet/coin-value-rules',
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
registerDetailRoute({
  parentPath: '/inventory/factory-inventory-upload',
  resolveEntityName: (id) => getBatchById(id)?.batchName,
})
registerDetailRoute({
  parentPath: '/inventory/product-batches',
  resolveEntityName: (id) => getProductionBatchById(id)?.batchNo,
})
registerDetailRoute({
  parentPath: '/marketing-products/products-catelog',
  resolveEntityName: (id) => getShowcaseProductById(id)?.productName,
})
registerDetailRoute({
  parentPath: '/marketing-products/interested-users',
  resolveEntityName: (id) => getInterestedUserById(id)?.userName,
})
registerDetailRoute({
  parentPath: '/scheme-management/schemes/general',
  resolveEntityName: (id) => getSchemeById(id)?.schemeName,
})
registerDetailRoute({
  parentPath: '/scheme-management/schemes/sessional',
  resolveEntityName: (id) => getSchemeById(id)?.schemeName,
})
registerDetailRoute({
  parentPath: '/scheme-management/gift-catalogue',
  resolveEntityName: (id) => getGiftById(id)?.giftName,
})
registerDetailRoute({
  parentPath: '/scheme-management/gift-rules',
  resolveEntityName: (id) => getRewardRuleById(id)?.rewardName,
})
registerDetailRoute({
  parentPath: '/rewards-wallet/wallet-management',
  resolveEntityName: (id) => getWalletById(id)?.userName,
})
registerDetailRoute({
  parentPath: '/rewards-wallet/reward-redemptions',
  resolveEntityName: (id) => getRedemptionRequestById(id)?.rewardItem,
})
registerDetailRoute({
  parentPath: '/rewards-wallet/coin-value-rules',
  resolveEntityName: (id) => getCoinValueRuleById(id)?.modelCode,
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
        <Route path="/inventory/factory-inventory-upload" element={<FactoryUploadListPage />} />
        <Route path="/inventory/factory-inventory-upload/new" element={<FactoryUploadFormPage />} />
        <Route path="/inventory/factory-inventory-upload/:batchId" element={<FactoryUploadDetailsPage />} />
        <Route path="/inventory/factory-inventory-upload/:batchId/:containerId" element={<FactoryContainerPage />} />
        <Route path="/inventory/factory-inventory-upload/:batchId/:containerId/:boxId" element={<FactoryBoxPage />} />
        <Route path="/inventory/product-batches" element={<ProductBatchesPage />} />
        <Route path="/inventory/product-batches/:batchId" element={<ProductionBatchDetailsPage />} />
        <Route path="/marketing-products/products-catelog" element={<ProductsCatalogPage />} />
        <Route path="/marketing-products/products-catelog/new" element={<ProductCatalogFormPage />} />
        <Route path="/marketing-products/products-catelog/:productId" element={<ProductCatalogDetailsPage />} />
        <Route path="/marketing-products/products-catelog/:productId/edit" element={<ProductCatalogFormPage />} />
        <Route path="/marketing-products/interested-users" element={<InterestedUsersPage />} />
        <Route path="/marketing-products/interested-users/:leadId" element={<InterestedUserDetailsPage />} />
        <Route path="/scheme-management/schemes/general" element={<GeneralSchemesListPage />} />
        <Route path="/scheme-management/schemes/sessional" element={<SeasonalSchemesListPage />} />
        <Route path="/scheme-management/schemes/:category/new" element={<SchemeFormPage />} />
        <Route path="/scheme-management/schemes/:category/:schemeId" element={<SchemeDetailsPage />} />
        <Route path="/scheme-management/schemes/:category/:schemeId/edit" element={<SchemeFormPage />} />
        <Route path="/scheme-management/gift-catalogue" element={<GiftCatalogueListPage />} />
        <Route path="/scheme-management/gift-catalogue/new" element={<GiftFormPage />} />
        <Route path="/scheme-management/gift-catalogue/:giftId" element={<GiftDetailsPage />} />
        <Route path="/scheme-management/gift-catalogue/:giftId/edit" element={<GiftFormPage />} />
        <Route path="/scheme-management/gift-rules" element={<GiftRulesListPage />} />
        <Route path="/scheme-management/gift-rules/new" element={<GiftRuleFormPage />} />
        <Route path="/scheme-management/gift-rules/:ruleId" element={<GiftRuleDetailsPage />} />
        <Route path="/scheme-management/gift-rules/:ruleId/edit" element={<GiftRuleFormPage />} />
        <Route path="/rewards-wallet/wallet-management" element={<WalletListPage />} />
        <Route path="/rewards-wallet/wallet-management/:walletId" element={<WalletDetailsPage />} />
        <Route path="/rewards-wallet/reward-redemptions" element={<RedemptionListPage />} />
        <Route path="/rewards-wallet/reward-redemptions/:requestId" element={<RedemptionDetailsPage />} />
        <Route path="/rewards-wallet/coin-value-rules" element={<CoinValueRulesListPage />} />
        <Route path="/rewards-wallet/coin-value-rules/:ruleId" element={<CoinValueRuleDetailsPage />} />
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
