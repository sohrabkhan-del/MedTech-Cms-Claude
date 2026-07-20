import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicRoute } from '@/features/auth/components/PublicRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { OtpPage } from '@/features/auth/pages/OtpPage'
import { FirstLoginResetPage } from '@/features/auth/pages/FirstLoginResetPage'
import { LogoutPage } from '@/pages/auth/LogoutPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { DealerListPage } from '@/features/userManagement/pages/DealerListPage'
import { DealerDetailsPage } from '@/features/userManagement/pages/DealerDetailsPage'
import { DealerFormPage } from '@/features/userManagement/pages/DealerFormPage'
import { ChemistListPage } from '@/pages/chemists/ChemistListPage'
import { ChemistDetailsPage } from '@/pages/chemists/ChemistDetailsPage'
import { ChemistFormPage } from '@/pages/chemists/ChemistFormPage'
import { LiveScanFeedPage } from '@/features/fieldOperations/pages/LiveScanFeedPage'
import { SecurityAlertsPage } from '@/features/fieldOperations/pages/SecurityAlertsPage'
import { GeoFenceManagementPage } from '@/features/fieldOperations/pages/GeoFenceManagementPage'
import { GeoFenceDetailsPage } from '@/features/fieldOperations/pages/GeoFenceDetailsPage'
import { GeoFenceFormPage } from '@/features/fieldOperations/pages/GeoFenceFormPage'
import { ApprovalRequestsListPage } from '@/features/userManagement/pages/ApprovalRequestsListPage'
import { ApprovalRequestDetailsPage } from '@/features/userManagement/pages/ApprovalRequestDetailsPage'
import { RejectedRequestsListPage } from '@/features/userManagement/pages/RejectedRequestsListPage'
import { RejectedRequestDetailsPage } from '@/features/userManagement/pages/RejectedRequestDetailsPage'
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
import { ProductsCatalogPage } from '@/features/marketingProducts/pages/ProductsCatalogPage'
import { ProductCatalogDetailsPage } from '@/features/marketingProducts/pages/ProductCatalogDetailsPage'
import { ProductCatalogFormPage } from '@/features/marketingProducts/pages/ProductCatalogFormPage'
import { InterestedUsersPage } from '@/features/marketingProducts/pages/InterestedUsersPage'
import { InterestedUserDetailsPage } from '@/features/marketingProducts/pages/InterestedUserDetailsPage'
import { GeneralSchemesListPage } from '@/features/schemeManagement/pages/GeneralSchemesListPage'
import { SeasonalSchemesListPage } from '@/features/schemeManagement/pages/SeasonalSchemesListPage'
import { SchemeDetailsPage } from '@/features/schemeManagement/pages/SchemeDetailsPage'
import { SchemeFormPage } from '@/features/schemeManagement/pages/SchemeFormPage'
import { GiftCatalogueListPage } from '@/features/schemeManagement/pages/GiftCatalogueListPage'
import { GiftDetailsPage } from '@/features/schemeManagement/pages/GiftDetailsPage'
import { GiftFormPage } from '@/features/schemeManagement/pages/GiftFormPage'
import { GiftRulesListPage } from '@/features/schemeManagement/pages/GiftRulesListPage'
import { GiftRuleDetailsPage } from '@/features/schemeManagement/pages/GiftRuleDetailsPage'
import { GiftRuleFormPage } from '@/features/schemeManagement/pages/GiftRuleFormPage'
import { WalletListPage } from '@/features/rewardsWallet/pages/WalletListPage'
import { WalletDetailsPage } from '@/features/rewardsWallet/pages/WalletDetailsPage'
import { RedemptionListPage } from '@/features/rewardsWallet/pages/RedemptionListPage'
import { RedemptionDetailsPage } from '@/features/rewardsWallet/pages/RedemptionDetailsPage'
import { CoinValueRulesListPage } from '@/features/rewardsWallet/pages/CoinValueRulesListPage'
import { CoinValueRuleDetailsPage } from '@/features/rewardsWallet/pages/CoinValueRuleDetailsPage'
import { AppearanceSettingsPage } from '@/features/settings/pages/AppearanceSettingsPage'
import { AdminListPage } from '@/features/systemUsers/pages/AdminListPage'
import { AdminDetailsPage } from '@/features/systemUsers/pages/AdminDetailsPage'
import { AdminFormPage } from '@/features/systemUsers/pages/AdminFormPage'
import { MedicalRepListPage } from '@/features/systemUsers/pages/MedicalRepListPage'
import { MedicalRepDetailsPage } from '@/features/systemUsers/pages/MedicalRepDetailsPage'
import { MedicalRepFormPage } from '@/features/systemUsers/pages/MedicalRepFormPage'
import { ProductCategoryListPage } from '@/features/masters/pages/ProductCategoryListPage'
import { ProductCategoryDetailsPage } from '@/features/masters/pages/ProductCategoryDetailsPage'
import { ProductCategoryFormPage } from '@/features/masters/pages/ProductCategoryFormPage'
import { MasterScanLogListPage } from '@/features/audit/pages/MasterScanLogListPage'
import { MasterScanLogDetailsPage } from '@/features/audit/pages/MasterScanLogDetailsPage'
import { AuditLogListPage } from '@/features/audit/pages/AuditLogListPage'
import { AuditLogDetailsPage } from '@/features/audit/pages/AuditLogDetailsPage'
import { ScanReportListPage } from '@/pages/reports/ScanReportListPage'
import { ScanReportDetailsPage } from '@/pages/reports/ScanReportDetailsPage'
import { RewardReportListPage } from '@/pages/reports/RewardReportListPage'
import { RewardReportDetailsPage } from '@/pages/reports/RewardReportDetailsPage'
import { WalletReportListPage } from '@/pages/reports/WalletReportListPage'
import { WalletReportDetailsPage } from '@/pages/reports/WalletReportDetailsPage'
import { DealerReportListPage } from '@/pages/reports/DealerReportListPage'
import { DealerReportDetailsPage } from '@/pages/reports/DealerReportDetailsPage'
import { ChemistReportListPage } from '@/pages/reports/ChemistReportListPage'
import { ChemistReportDetailsPage } from '@/pages/reports/ChemistReportDetailsPage'
import { MrPerformanceListPage } from '@/pages/reports/MrPerformanceListPage'
import { MrPerformanceDetailsPage } from '@/pages/reports/MrPerformanceDetailsPage'
import { ProductReportListPage } from '@/pages/reports/ProductReportListPage'
import { ProductReportDetailsPage } from '@/pages/reports/ProductReportDetailsPage'
import { SchemeReportListPage } from '@/pages/reports/SchemeReportListPage'
import { SchemeReportDetailsPage } from '@/pages/reports/SchemeReportDetailsPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { routeEntries, registerDetailRoute } from '@/routes/routeConfig'
import { getDealerById } from '@/features/dealers/mockDealers'
import { getChemistById } from '@/features/chemists/mockChemists'
import { getGeoFenceById } from '@/features/fieldOperations/mocks/mockGeoFences'
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
import { getAdminById } from '@/features/systemUsers/mockAdmins'
import { getMedicalRepById } from '@/features/systemUsers/mockMedicalReps'
import { getProductCategoryById } from '@/features/masters/mockProductCategories'
import { getMasterScanLogById } from '@/features/audit/mockMasterScanLogs'
import { getAuditLogById } from '@/features/audit/mockAuditLogs'
import { getScanReportById } from '@/features/reports/mockScanReports'
import { getRewardReportById } from '@/features/reports/mockRewardReports'
import { getWalletReportById } from '@/features/reports/mockWalletReports'
import { getDealerReportById } from '@/features/reports/mockDealerReports'
import { getChemistReportById } from '@/features/reports/mockChemistReports'
import { getMrPerformanceReportById } from '@/features/reports/mockMrPerformanceReports'
import { getProductReportById } from '@/features/reports/mockProductReports'
import { getSchemeReportById } from '@/features/reports/mockSchemeReports'

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
  '/system-users/admin',
  '/system-users/medical-representatives',
  '/masters/product-categories',
  '/audit/master-scan-table-logs',
  '/audit/audit-logs',
  '/reports/scan-reports',
  '/reports/reward-reports',
  '/reports/wallet-reports',
  '/reports/dealer-reports',
  '/reports/chemist-reports',
  '/reports/mr-performance',
  '/reports/product-reports-1',
  '/reports/product-reports-2',
  '/reports/scheme-reports',
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
registerDetailRoute({
  parentPath: '/system-users/admin',
  resolveEntityName: (id) => getAdminById(id)?.name,
})
registerDetailRoute({
  parentPath: '/system-users/medical-representatives',
  resolveEntityName: (id) => getMedicalRepById(id)?.name,
})
registerDetailRoute({
  parentPath: '/masters/product-categories',
  resolveEntityName: (id) => getProductCategoryById(id)?.categoryName,
})
registerDetailRoute({
  parentPath: '/audit/master-scan-table-logs',
  resolveEntityName: (id) => getMasterScanLogById(id)?.barcodeNumber,
})
registerDetailRoute({
  parentPath: '/audit/audit-logs',
  resolveEntityName: (id) => getAuditLogById(id)?.id,
})
registerDetailRoute({
  parentPath: '/reports/scan-reports',
  resolveEntityName: (id) => getScanReportById(id)?.productName,
})
registerDetailRoute({
  parentPath: '/reports/reward-reports',
  resolveEntityName: (id) => getRewardReportById(id)?.userName,
})
registerDetailRoute({
  parentPath: '/reports/wallet-reports',
  resolveEntityName: (id) => getWalletReportById(id)?.userName,
})
registerDetailRoute({
  parentPath: '/reports/dealer-reports',
  resolveEntityName: (id) => getDealerReportById(id)?.dealerName,
})
registerDetailRoute({
  parentPath: '/reports/chemist-reports',
  resolveEntityName: (id) => getChemistReportById(id)?.chemistName,
})
registerDetailRoute({
  parentPath: '/reports/mr-performance',
  resolveEntityName: (id) => getMrPerformanceReportById(id)?.mrName,
})
registerDetailRoute({
  parentPath: '/reports/product-reports-1',
  resolveEntityName: (id) => getProductReportById(id)?.productName,
})
registerDetailRoute({
  parentPath: '/reports/product-reports-2',
  resolveEntityName: (id) => getProductReportById(id)?.productName,
})
registerDetailRoute({
  parentPath: '/reports/scheme-reports',
  resolveEntityName: (id) => getSchemeReportById(id)?.schemeName,
})

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/first-login-reset" element={<FirstLoginResetPage />} />
        </Route>
      </Route>

      <Route path="/logout" element={<LogoutPage />} />

      <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/field-operations/live-scan-feed" element={<LiveScanFeedPage />} />
        <Route path="/field-operations/security-alerts" element={<SecurityAlertsPage />} />
        <Route path="/field-operations/geo-fence-management" element={<GeoFenceManagementPage />} />
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
        <Route path="/system-users/admin" element={<AdminListPage />} />
        <Route path="/system-users/admin/new" element={<AdminFormPage />} />
        <Route path="/system-users/admin/:adminId" element={<AdminDetailsPage />} />
        <Route path="/system-users/admin/:adminId/edit" element={<AdminFormPage />} />
        <Route path="/system-users/medical-representatives" element={<MedicalRepListPage />} />
        <Route path="/system-users/medical-representatives/new" element={<MedicalRepFormPage />} />
        <Route path="/system-users/medical-representatives/:mrId" element={<MedicalRepDetailsPage />} />
        <Route path="/system-users/medical-representatives/:mrId/edit" element={<MedicalRepFormPage />} />
        <Route path="/masters/product-categories" element={<ProductCategoryListPage />} />
        <Route path="/masters/product-categories/new" element={<ProductCategoryFormPage />} />
        <Route path="/masters/product-categories/:categoryId" element={<ProductCategoryDetailsPage />} />
        <Route path="/masters/product-categories/:categoryId/edit" element={<ProductCategoryFormPage />} />
        <Route path="/audit/master-scan-table-logs" element={<MasterScanLogListPage />} />
        <Route path="/audit/master-scan-table-logs/:logId" element={<MasterScanLogDetailsPage />} />
        <Route path="/audit/audit-logs" element={<AuditLogListPage />} />
        <Route path="/audit/audit-logs/:logId" element={<AuditLogDetailsPage />} />
        <Route path="/reports/scan-reports" element={<ScanReportListPage />} />
        <Route path="/reports/scan-reports/:scanId" element={<ScanReportDetailsPage />} />
        <Route path="/reports/reward-reports" element={<RewardReportListPage />} />
        <Route path="/reports/reward-reports/:rewardId" element={<RewardReportDetailsPage />} />
        <Route path="/reports/wallet-reports" element={<WalletReportListPage />} />
        <Route path="/reports/wallet-reports/:walletReportId" element={<WalletReportDetailsPage />} />
        <Route path="/reports/dealer-reports" element={<DealerReportListPage />} />
        <Route path="/reports/dealer-reports/:dealerReportId" element={<DealerReportDetailsPage />} />
        <Route path="/reports/chemist-reports" element={<ChemistReportListPage />} />
        <Route path="/reports/chemist-reports/:chemistReportId" element={<ChemistReportDetailsPage />} />
        <Route path="/reports/mr-performance" element={<MrPerformanceListPage />} />
        <Route path="/reports/mr-performance/:mrReportId" element={<MrPerformanceDetailsPage />} />
        <Route path="/reports/product-reports-1" element={<ProductReportListPage />} />
        <Route path="/reports/product-reports-1/:productReportId" element={<ProductReportDetailsPage />} />
        <Route path="/reports/product-reports-2" element={<ProductReportListPage />} />
        <Route path="/reports/scheme-reports" element={<SchemeReportListPage />} />
        <Route path="/reports/scheme-reports/:schemeReportId" element={<SchemeReportDetailsPage />} />
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
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
