export type NotificationCategory =
  | 'approval_request'
  | 'security_alert'
  | 'inventory'
  | 'redemption'
  | 'scheme'
  | 'system'

export type NotificationPriority = 'low' | 'medium' | 'high'

export interface AppNotification {
  id: string
  category: NotificationCategory
  title: string
  message: string
  priority: NotificationPriority
  createdAt: string
  isRead: boolean
  /** In-app route this notification deep-links to, e.g. /verification/approval-requests/AR-1001 */
  targetPath?: string
  actorName?: string
}
