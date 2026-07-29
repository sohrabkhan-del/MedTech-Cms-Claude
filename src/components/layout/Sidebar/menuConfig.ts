import type { LucideIcon } from 'lucide-react'
import {
  LayoutGrid,
  MapPin,
  BadgeCheck,
  LayoutDashboard,
  Bell,
  UploadCloud,
  Crosshair,
  ShieldAlert,
  Fence,
  Users,
  Store,
  Pill,
  ShieldCheck,
  ClipboardCheck,
  Ban,
  Package,
  Factory,
  Megaphone,
  Target,
  Gift,
  BarChart3,
  SlidersHorizontal,
  Wallet,
  Coins as Points,
  Redo2,
} from 'lucide-react'

export interface MenuItem {
  label: string
  path?: string
  icon?: LucideIcon
  badgeCount?: number
  children?: MenuItem[]
  /** Opts this listing page into the global RegionTopbar rendered by DashboardLayout. */
  showRegionTopbar?: boolean
  /** Hides the region (All India/North/South/East/West) selector within the RegionTopbar. */
  hideRegionSelector?: boolean
  /** Opens the notifications preview popover on click instead of navigating directly to `path`. */
  notificationsPopover?: boolean
}

export interface MenuGroup {
  groupLabel: string
  icon?: LucideIcon
  items: MenuItem[]
  /** When true, the group header toggles a collapsed/expanded state (collapsed by default). */
  collapsible?: boolean
}

export const menuConfig: MenuGroup[] = [
  {
    groupLabel: 'OVERVIEW',
    icon: LayoutGrid,
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        showRegionTopbar: true,
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: Bell,
        notificationsPopover: true,
      },
    ],
  },
  {
    groupLabel: 'FIELD OPERATIONS',
    icon: MapPin,
    items: [
      {
        label: 'Live Scan Feed',
        path: '/field-operations/live-scan-feed',
        icon: Crosshair,
        showRegionTopbar: true,
      },
      {
        label: 'Security Alerts',
        path: '/field-operations/security-alerts',
        icon: ShieldAlert,
        showRegionTopbar: true,
      },
      {
        label: 'Geo Fence Management',
        path: '/field-operations/geo-fence-management',
        icon: Fence,
        showRegionTopbar: true,
      },
    ],
  },
  {
    groupLabel: 'INVENTORY MANAGEMENT',
    icon: Package,
    items: [
      {
        label: 'Product Master',
        path: '/inventory/product-master',
        icon: Package,
        showRegionTopbar: true,
        hideRegionSelector: true,
      },
      {
        label: 'Factory Inventory Upload',
        path: '/inventory/factory-inventory-upload',
        icon: Factory,
        showRegionTopbar: true,
        hideRegionSelector: true,
      },
      {
        label: 'Distributor Upload',
        path: '/distributor-upload',
        icon: UploadCloud,
        showRegionTopbar: true,
        hideRegionSelector: true,
      },
      {
        label: 'Product Categories',
        path: '/masters/product-categories',
        icon: SlidersHorizontal,
        showRegionTopbar: true,
        hideRegionSelector: true,
      },
    ],
  },

  {
    groupLabel: 'PARTNERS',
    icon: Users,
    items: [
      {
        label: 'Dealers',
        path: '/partners/dealers',
        icon: Store,
        showRegionTopbar: true,
      },
      {
        label: 'Chemists',
        path: '/partners/chemists',
        icon: Pill,
        showRegionTopbar: true,
      },
    ],
  },
  {
    groupLabel: 'VERIFICATION',
    icon: ShieldCheck,
    items: [
      {
        label: 'Approval Requests',
        path: '/verification/approval-requests',
        icon: ClipboardCheck,
        badgeCount: 3,
        showRegionTopbar: true,
      },
      {
        label: 'Rejected Requests',
        path: '/verification/rejected-requests',
        icon: Ban,
        showRegionTopbar: true,
      },
    ],
  },

  {
    groupLabel: 'MARKETING PRODUCTS',
    icon: Megaphone,
    items: [
      {
        label: 'Marketing Catalogue',
        path: '/marketing-products/products-catelog',
        icon: Megaphone,
        showRegionTopbar: true,
        hideRegionSelector: true,
      },
      {
        label: 'Interested Users',
        path: '/marketing-products/interested-users',
        icon: Users,
        showRegionTopbar: true,
      },
    ],
  },

  {
    groupLabel: 'SCHEME MANAGEMENT',
    icon: Target,
    items: [
      {
        label: 'Schemes',
        path: '/scheme-management/schemes',
        icon: Target,
        showRegionTopbar: true,
      },
      {
        label: 'Gift Catalogue',
        path: '/scheme-management/gift-catalogue',
        icon: Gift,
        showRegionTopbar: true,
      },
    ],
  },
  {
    groupLabel: 'REWARDS & WALLET',
    icon: Wallet,
    items: [
      {
        label: 'Point Value Rules',
        path: '/rewards-wallet/point-value-rules/all',
        icon: Points,
        showRegionTopbar: true,
      },
      {
        label: 'Wallet Management',
        path: '/rewards-wallet/wallet-management',
        icon: Wallet,
        showRegionTopbar: true,
      },
      {
        label: 'Reward Redemptions',
        path: '/rewards-wallet/reward-redemptions',
        icon: Redo2,
        showRegionTopbar: true,
      },
    ],
  },
  {
    groupLabel: 'REPORTS & ANALYTICS',
    icon: BarChart3,
    items: [
      {
        label: 'Reports',
        icon: BarChart3,
        children: [
          {
            label: 'Scan Reports',
            path: '/reports/scan-reports',
            icon: BarChart3,
            showRegionTopbar: true,
          },
          {
            label: 'Reward Reports',
            path: '/reports/reward-reports',
            icon: BarChart3,
            showRegionTopbar: true,
          },
          {
            label: 'Wallet Reports',
            path: '/reports/wallet-reports',
            icon: BarChart3,
            showRegionTopbar: true,
          },
          {
            label: 'Dealer Reports',
            path: '/reports/dealer-reports',
            icon: BarChart3,
            showRegionTopbar: true,
          },
          {
            label: 'Chemist Reports',
            path: '/reports/chemist-reports',
            icon: BarChart3,
            showRegionTopbar: true,
          },
          {
            label: 'MR Performance',
            path: '/reports/mr-performance',
            icon: BarChart3,
            showRegionTopbar: true,
          },
          // {
          //   label: 'Product Reports (Dealer)',
          //   path: '/reports/product-reports-1',
          //   icon: BarChart3,
          // },
          // {
          //   label: 'Product Reports (Chemist)',
          //   path: '/reports/product-reports-2',
          //   icon: BarChart3,
          // },
          // {
          //   label: 'Scheme Reports',
          //   path: '/reports/scheme-reports',
          //   icon: BarChart3,
          // },
        ],
      },
    ],
  },

  {
    groupLabel: 'System Users',
    icon: BadgeCheck,
    items: [
      {
        label: 'System User',
        icon: BadgeCheck,
        children: [
          {
            label: 'Medical Representatives (MR)',
            path: '/system-users/medical-representatives',
            showRegionTopbar: true,
          },
          {
            label: 'Admin',
            path: '/system-users/admin',
            showRegionTopbar: true,
          },
        ],
      },
    ],
  },

  // {
  //   groupLabel: 'Audit',
  //   icon: ClipboardList,
  //   items: [
  //     { label: 'Audit Logs', path: '/audit/audit-logs', icon: ClipboardList },
  //     {
  //       label: 'Master Scan Table Logs',
  //       path: '/audit/master-scan-table-logs',
  //       icon: ListTree,
  //     },
  //   ],
  // },
]
