import type { SvgIconComponent } from '@mui/icons-material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import GppMaybeIcon from '@mui/icons-material/GppMaybe'
import FenceIcon from '@mui/icons-material/Fence'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import RuleIcon from '@mui/icons-material/Rule'
import BlockIcon from '@mui/icons-material/Block'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import FactoryIcon from '@mui/icons-material/Factory'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import CampaignIcon from '@mui/icons-material/Campaign'
import Diversity3Icon from '@mui/icons-material/Diversity3'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import RuleFolderIcon from '@mui/icons-material/RuleFolder'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import RedeemIcon from '@mui/icons-material/Redeem'
import BarChartIcon from '@mui/icons-material/BarChart'
import ListAltIcon from '@mui/icons-material/ListAlt'
import TuneIcon from '@mui/icons-material/Tune'

export interface MenuItem {
  label: string
  path?: string
  icon?: SvgIconComponent
  badgeCount?: number
  children?: MenuItem[]
}

export interface MenuGroup {
  groupLabel: string
  icon?: SvgIconComponent
  items: MenuItem[]
}

export const menuConfig: MenuGroup[] = [
  {
    groupLabel: 'OVERVIEW',
    items: [{ label: 'Dashboard', path: '/dashboard', icon: DashboardIcon }],
  },
  {
    groupLabel: 'FIELD OPERATIONS',
    items: [
      { label: 'Live Scan Feed', path: '/field-operations/live-scan-feed', icon: MyLocationIcon },
      {
        label: 'Security Alerts (Normal Alert)',
        path: '/field-operations/security-alerts',
        icon: GppMaybeIcon,
      },
      { label: 'Geo Fence Management', path: '/field-operations/geo-fence-management', icon: FenceIcon },
    ],
  },
  {
    groupLabel: 'PARTNERS',
    icon: PeopleAltIcon,
    items: [
      { label: 'Dealers', path: '/partners/dealers', icon: StorefrontIcon },
      { label: 'Chemists', path: '/partners/chemists', icon: LocalPharmacyIcon },
    ],
  },
  {
    groupLabel: 'VERIFICATION',
    icon: VerifiedUserIcon,
    items: [
      { label: 'Approval Requests', path: '/verification/approval-requests', icon: RuleIcon, badgeCount: 3 },
      { label: 'Rejected Requests', path: '/verification/rejected-requests', icon: BlockIcon },
    ],
  },
  {
    groupLabel: 'INVENTORY MANAGEMENT',
    items: [
      { label: 'Product Master', path: '/inventory/product-master', icon: Inventory2Icon },
      { label: 'Factory Inventory Upload', path: '/inventory/factory-inventory-upload', icon: FactoryIcon },
      { label: 'Product Batches', path: '/inventory/product-batches', icon: ViewInArIcon },
      { label: 'Delivery upload', path: '/inventory/delivery-upload', icon: LocalShippingIcon },
    ],
  },
  {
    groupLabel: 'MARKETING PRODUCTS',
    items: [
      { label: 'Products Catelog', path: '/marketing-products/products-catelog', icon: CampaignIcon },
      { label: 'Interested Users', path: '/marketing-products/interested-users', icon: Diversity3Icon },
    ],
  },
  {
    groupLabel: 'SCHEME MANAGEMENT',
    items: [
      {
        label: 'Schemes',
        icon: TrackChangesIcon,
        children: [
          { label: 'General Schemes', path: '/scheme-management/schemes/general' },
          { label: 'Sessional Schemes', path: '/scheme-management/schemes/sessional' },
        ],
      },
      { label: 'Gift Catalogue', path: '/scheme-management/gift-catalogue', icon: CardGiftcardIcon },
      {
        label: 'Gift Rules (Funtional Values)',
        path: '/scheme-management/gift-rules',
        icon: RuleFolderIcon,
      },
    ],
  },
  {
    groupLabel: 'REWARDS & WALLET',
    items: [
      {
        label: 'Coin Value Rules',
        icon: EmojiEventsIcon,
        children: [{ label: "Dealer/Chemist (Tab's)", path: '/rewards-wallet/coin-value-rules' }],
      },
      { label: 'Wallet Management', path: '/rewards-wallet/wallet-management', icon: AccountBalanceWalletIcon },
      { label: 'Reward Redemptions', path: '/rewards-wallet/reward-redemptions', icon: RedeemIcon },
    ],
  },
  {
    groupLabel: 'REPORTS & ANALYTICS',
    items: [
      { label: 'Scan Reports', path: '/reports/scan-reports', icon: BarChartIcon },
      { label: 'Reward Reports', path: '/reports/reward-reports', icon: BarChartIcon },
      { label: 'Wallet Reports', path: '/reports/wallet-reports', icon: BarChartIcon },
      { label: 'Dealer Reports', path: '/reports/dealer-reports', icon: BarChartIcon },
      { label: 'Chemist Reports', path: '/reports/chemist-reports', icon: BarChartIcon },
      { label: 'MR Performance', path: '/reports/mr-performance', icon: BarChartIcon },
      { label: 'Product Reports', path: '/reports/product-reports-1', icon: BarChartIcon },
      { label: 'Product Reports', path: '/reports/product-reports-2', icon: BarChartIcon },
      { label: 'Scheme Reports', path: '/reports/scheme-reports', icon: BarChartIcon },
    ],
  },
  {
    groupLabel: 'System Users',
    items: [
      { label: 'Admin', path: '/system-users/admin' },
      { label: 'Medical Representatives (MR)', path: '/system-users/medical-representatives' },
    ],
  },
  {
    groupLabel: 'Masters',
    icon: TuneIcon,
    items: [
      { label: 'Regions', path: '/masters/regions' },
      { label: 'Product Categories', path: '/masters/product-categories' },
    ],
  },
  {
    groupLabel: 'Audit',
    items: [
      { label: 'Audit Logs', path: '/audit/audit-logs', icon: ListAltIcon },
      { label: 'Master Scan Table Logs', path: '/audit/master-scan-table-logs', icon: ListAltIcon },
    ],
  },
]
