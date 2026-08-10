import {
  AlertTriangle,
  Bell,
  Gift,
  Handshake,
  Megaphone,
  Package,
  ScanLine,
  ShieldAlert,
  ShoppingCart,
  UserPlus,
  Wallet,
} from 'lucide-react'
import type { NotificationCategory, NotificationPriority } from '@/types/notification'

export const categoryConfig: Record<
  NotificationCategory,
  { label: string; icon: typeof Bell; color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' }
> = {
  approval_request: { label: 'Approval Request', icon: UserPlus, color: 'primary' },
  security_alert: { label: 'Security Alert', icon: ShieldAlert, color: 'error' },
  inventory: { label: 'Inventory', icon: Package, color: 'info' },
  redemption: { label: 'Redemption', icon: Gift, color: 'secondary' },
  scheme: { label: 'Scheme', icon: AlertTriangle, color: 'warning' },
  system: { label: 'System', icon: Bell, color: 'primary' },
  visit: { label: 'Field Visit', icon: UserPlus, color: 'info' },
  promotional: { label: 'Promotional', icon: Megaphone, color: 'secondary' },
  wallet: { label: 'Wallet', icon: Wallet, color: 'success' },
  partner_onboarding: { label: 'Partner Onboarding', icon: Handshake, color: 'primary' },
  order: { label: 'Order', icon: ShoppingCart, color: 'warning' },
  reward: { label: 'Reward', icon: Gift, color: 'secondary' },
  product_scan: { label: 'Product Scan', icon: ScanLine, color: 'error' },
  general: { label: 'General', icon: Bell, color: 'primary' },
}

export const priorityConfig: Record<NotificationPriority, { label: string; color: 'success' | 'warning' | 'error' }> = {
  low: { label: 'Low', color: 'success' },
  medium: { label: 'Medium', color: 'warning' },
  high: { label: 'High', color: 'error' },
  urgent: { label: 'Urgent', color: 'error' },
}

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffMinutes = Math.round(diffMs / 60000)
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays}d ago`
}
