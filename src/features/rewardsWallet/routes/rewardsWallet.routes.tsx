import type { RouteObject } from 'react-router-dom'
import { WalletListPage } from '@/features/rewardsWallet/pages/WalletListPage'
import { WalletDetailsPage } from '@/features/rewardsWallet/pages/WalletDetailsPage'
import { RedemptionListPage } from '@/features/rewardsWallet/pages/RedemptionListPage'
import { RedemptionDetailsPage } from '@/features/rewardsWallet/pages/RedemptionDetailsPage'
import { PointValueRulesListPage } from '@/features/rewardsWallet/pages/PointValueRulesListPage'
import { PointValueRuleDetailsPage } from '@/features/rewardsWallet/pages/PointValueRuleDetailsPage'
import { EditBasePointValuePage } from '@/features/rewardsWallet/pages/EditBasePointValuePage'
import { RegionMultiplierRulesPage } from '@/features/rewardsWallet/pages/RegionMultiplierRulesPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
export const rewardsWalletRoutes: RouteObject[] = [
  { path: '/rewards-wallet/wallet-management', element: <WalletListPage /> },
  {
    path: '/rewards-wallet/wallet-management/:walletId',
    element: <WalletDetailsPage />,
  },
  {
    path: '/rewards-wallet/reward-redemptions',
    element: <RedemptionListPage />,
  },
  {
    path: '/rewards-wallet/reward-redemptions/:requestId',
    element: <RedemptionDetailsPage />,
  },
  {
    path: '/rewards-wallet/point-value-rules',
    element: <PointValueRulesListPage />,
  },
  {
    path: '/rewards-wallet/point-value-rules/region-multipliers',
    element: <RegionMultiplierRulesPage />,
  },
  {
    path: '/rewards-wallet/point-value-rules/:ruleId',
    element: <PointValueRuleDetailsPage />,
  },
  {
    path: '/rewards-wallet/point-value-rules/:ruleId/edit-base-value',
    element: <EditBasePointValuePage />,
  },
]
