import type { RouteObject } from 'react-router-dom'
import { WalletListPage } from '@/features/rewardsWallet/pages/WalletListPage'
import { WalletDetailsPage } from '@/features/rewardsWallet/pages/WalletDetailsPage'
import { RedemptionListPage } from '@/features/rewardsWallet/pages/RedemptionListPage'
import { RedemptionDetailsPage } from '@/features/rewardsWallet/pages/RedemptionDetailsPage'
import { CoinValueRulesListPage } from '@/features/rewardsWallet/pages/CoinValueRulesListPage'
import { CoinValueRuleDetailsPage } from '@/features/rewardsWallet/pages/CoinValueRuleDetailsPage'

// Register under <ProtectedRoute /> + <DashboardLayout />.
export const rewardsWalletRoutes: RouteObject[] = [
  { path: '/rewards-wallet/wallet-management', element: <WalletListPage /> },
  { path: '/rewards-wallet/wallet-management/:walletId', element: <WalletDetailsPage /> },
  { path: '/rewards-wallet/reward-redemptions', element: <RedemptionListPage /> },
  { path: '/rewards-wallet/reward-redemptions/:requestId', element: <RedemptionDetailsPage /> },
  { path: '/rewards-wallet/coin-value-rules', element: <CoinValueRulesListPage /> },
  { path: '/rewards-wallet/coin-value-rules/:ruleId', element: <CoinValueRuleDetailsPage /> },
]
