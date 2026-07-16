import type { SvgIconComponent } from '@mui/icons-material'
import GridViewIcon from '@mui/icons-material/GridViewOutlined'
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined'
import BadgeIcon from '@mui/icons-material/BadgeOutlined'
import DashboardIcon from '@mui/icons-material/DashboardOutlined'
import MyLocationIcon from '@mui/icons-material/MyLocationOutlined'
import GppMaybeIcon from '@mui/icons-material/GppMaybeOutlined'
import FenceIcon from '@mui/icons-material/FenceOutlined'
import PeopleAltIcon from '@mui/icons-material/PeopleAltOutlined'
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacyOutlined'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserOutlined'
import RuleIcon from '@mui/icons-material/RuleOutlined'
import BlockIcon from '@mui/icons-material/BlockOutlined'
import Inventory2Icon from '@mui/icons-material/Inventory2Outlined'
import FactoryIcon from '@mui/icons-material/FactoryOutlined'
import ViewInArIcon from '@mui/icons-material/ViewInArOutlined'
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined'
import CampaignIcon from '@mui/icons-material/CampaignOutlined'
import Diversity3Icon from '@mui/icons-material/Diversity3Outlined'
import TrackChangesIcon from '@mui/icons-material/TrackChangesOutlined'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcardOutlined'
import RuleFolderIcon from '@mui/icons-material/RuleFolderOutlined'
import EmojiEventsIcon from '@mui/icons-material/EmojiEventsOutlined'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import RedeemIcon from '@mui/icons-material/RedeemOutlined'
import BarChartIcon from '@mui/icons-material/BarChartOutlined'
import ListAltIcon from '@mui/icons-material/ListAltOutlined'
import TuneIcon from '@mui/icons-material/TuneOutlined'

export interface MenuItem {
  label: string
  path?: string
  icon?: SvgIconComponent
  badgeCount?: number
  children?: MenuItem[]
  /** Opts this listing page into the global RegionTopbar rendered by DashboardLayout. */
  showRegionTopbar?: boolean
}

export interface MenuGroup {
  groupLabel: string
  icon?: SvgIconComponent
  items: MenuItem[]
}

export const menuConfig: MenuGroup[] = [
  {
    groupLabel: 'OVERVIEW',
    icon: GridViewIcon,
    items: [{ label: 'Dashboard', path: '/dashboard', icon: DashboardIcon }],
  },
  {
    groupLabel: 'FIELD OPERATIONS',
    icon: LocationOnIcon,
    items: [
      { label: 'Live Scan Feed', path: '/field-operations/live-scan-feed', icon: MyLocationIcon, showRegionTopbar: true },
      {
        label: 'Security Alerts (Normal Alert)',
        path: '/field-operations/security-alerts',
        icon: GppMaybeIcon,
      },
      { label: 'Geo Fence Management', path: '/field-operations/geo-fence-management', icon: FenceIcon, showRegionTopbar: true },
    ],
  },
  {
    groupLabel: 'PARTNERS',
    icon: PeopleAltIcon,
    items: [
      { label: 'Dealers', path: '/partners/dealers', icon: StorefrontIcon, showRegionTopbar: true },
      { label: 'Chemists', path: '/partners/chemists', icon: LocalPharmacyIcon, showRegionTopbar: true },
    ],
  },
  {
    groupLabel: 'VERIFICATION',
    icon: VerifiedUserIcon,
    items: [
      { label: 'Approval Requests', path: '/verification/approval-requests', icon: RuleIcon, badgeCount: 3, showRegionTopbar: true },
      { label: 'Rejected Requests', path: '/verification/rejected-requests', icon: BlockIcon, showRegionTopbar: true },
    ],
  },
  {
    groupLabel: 'INVENTORY MANAGEMENT',
    icon: Inventory2Icon,
    items: [
      { label: 'Product Master', path: '/inventory/product-master', icon: Inventory2Icon, showRegionTopbar: true },
      { label: 'Factory Inventory Upload', path: '/inventory/factory-inventory-upload', icon: FactoryIcon },
      { label: 'Product Batches', path: '/inventory/product-batches', icon: ViewInArIcon },
      { label: 'Delivery upload', path: '/inventory/delivery-upload', icon: LocalShippingIcon },
    ],
  },
  {
    groupLabel: 'MARKETING PRODUCTS',
    icon: CampaignIcon,
    items: [
      { label: 'Products Catelog', path: '/marketing-products/products-catelog', icon: CampaignIcon },
      { label: 'Interested Users', path: '/marketing-products/interested-users', icon: Diversity3Icon },
    ],
  },
  {
    groupLabel: 'SCHEME MANAGEMENT',
    icon: TrackChangesIcon,
    items: [
      { label: 'General Schemes', path: '/scheme-management/schemes/general', icon: TrackChangesIcon },
      { label: 'Sessional Schemes', path: '/scheme-management/schemes/sessional', icon: TrackChangesIcon },
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
    icon: AccountBalanceWalletIcon,
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
    icon: BarChartIcon,
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
    icon: BadgeIcon,
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
    icon: ListAltIcon,
    items: [
      { label: 'Audit Logs', path: '/audit/audit-logs', icon: ListAltIcon },
      { label: 'Master Scan Table Logs', path: '/audit/master-scan-table-logs', icon: ListAltIcon },
    ],
  },
]
