import type { AppNotification } from '@/types/notification'
import { mockApprovalRequests } from '@/features/userManagement/mockApprovalRequests'
import { mockRedemptionRequests } from '@/features/rewardsWallet/mockRedemptions'
import { mockSecurityAlerts } from '@/features/fieldOperations/mocks/mockSecurityAlerts'

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function buildNotifications(): AppNotification[] {
  const notifications: AppNotification[] = []

  mockApprovalRequests
    .filter((request) => request.status === 'pending')
    .slice(0, 5)
    .forEach((request, index) => {
      notifications.push({
        id: `ntf-approval-${request.id}`,
        category: 'approval_request',
        title: 'New approval request',
        message: `${request.applicantName} submitted a ${request.requestType.toLowerCase()} onboarding request awaiting your review.`,
        priority: 'high',
        createdAt: hoursAgo(index * 3 + 1),
        isRead: index > 2,
        targetPath: `/verification/approval-requests/${request.id}`,
        actorName: request.applicantName,
      })
    })

  mockSecurityAlerts.slice(0, 4).forEach((alert, index) => {
    notifications.push({
      id: `ntf-alert-${alert.id}`,
      category: 'security_alert',
      title: 'Security alert flagged',
      message: `${alert.alertType} detected for ${alert.userName} (source IP ${alert.sourceIp}).`,
      priority: 'high',
      createdAt: hoursAgo(index * 5 + 2),
      isRead: index > 1,
      targetPath: '/field-operations/security-alerts',
      actorName: alert.userName,
    })
  })

  mockRedemptionRequests
    .filter((request) => request.redemptionStatus === 'pending')
    .slice(0, 4)
    .forEach((request, index) => {
      notifications.push({
        id: `ntf-redemption-${request.id}`,
        category: 'redemption',
        title: 'Reward redemption requested',
        message: `${request.userName} requested redemption for ${request.rewardItem}.`,
        priority: 'medium',
        createdAt: hoursAgo(index * 7 + 4),
        isRead: index > 1,
        targetPath: `/rewards-wallet/reward-redemptions/${request.id}`,
        actorName: request.userName,
      })
    })

  notifications.push(
    {
      id: 'ntf-inventory-1',
      category: 'inventory',
      title: 'Factory inventory upload completed',
      message: 'Batch BTC-88291 was processed successfully and is ready for verification.',
      priority: 'low',
      createdAt: hoursAgo(10),
      isRead: true,
      targetPath: '/inventory/factory-inventory-upload',
    },
    {
      id: 'ntf-scheme-1',
      category: 'scheme',
      title: 'Scheme ending soon',
      message: 'Monsoon Bonanza 2026 ends in 12 days. Review redemption progress before it closes.',
      priority: 'medium',
      createdAt: hoursAgo(18),
      isRead: true,
      targetPath: '/scheme-management/schemes/sessional',
    },
    {
      id: 'ntf-system-1',
      category: 'system',
      title: 'Scheduled maintenance',
      message: 'MedTech CMS will undergo scheduled maintenance this weekend between 1 AM and 3 AM IST.',
      priority: 'low',
      createdAt: hoursAgo(30),
      isRead: true,
    },
  )

  return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const mockNotifications: AppNotification[] = buildNotifications()

export function getNotificationById(id: string): AppNotification | undefined {
  return mockNotifications.find((notification) => notification.id === id)
}
