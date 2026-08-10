import { baseApi } from '@/store/api/baseApi'
import { mockDelay } from '@/services/mockDelay'
import { mockNotifications } from '@/features/notifications/mockNotifications'
import type { AppNotification, NotificationCategory } from '@/types/notification'

export interface NotificationStats {
  total: number
  read: number
  unread: number
}

interface NotificationStatsApiResponse {
  success: boolean
  data: NotificationStats
}

const mockNotificationStats: NotificationStats = {
  total: 0,
  read: 0,
  unread: 0,
}

/** Raw notification item shape as returned by the API. */
export interface ApiNotification {
  id: string
  recipientId: string
  recipientType: string
  title: string
  body: string
  type: string
  channel: string
  priority: string
  data: Record<string, unknown>
  status: string
  sentAt: string
  failureReason: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

interface NotificationsListApiResponse {
  success: boolean
  data: {
    items: ApiNotification[]
    meta: {
      totalItems: number
      totalPages: number
      currentPage: number
      pageSize: number
    }
  }
}

const typeToCategory: Record<string, NotificationCategory> = {
  VISIT: 'visit',
  PROMOTIONAL: 'promotional',
  SYSTEM: 'system',
  WALLET: 'wallet',
  PARTNER_ONBOARDING: 'partner_onboarding',
  ORDER: 'order',
  REWARD: 'reward',
  PRODUCT_SCAN: 'product_scan',
  GENERAL: 'general',
  APPROVAL: 'approval_request',
  SECURITY: 'security_alert',
  INVENTORY: 'inventory',
  REDEMPTION: 'redemption',
  SCHEME: 'scheme',
}

const priorityMap: Record<string, AppNotification['priority']> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
}

function mapApiNotification(item: ApiNotification): AppNotification {
  return {
    id: item.id,
    category: typeToCategory[item.type] ?? 'system',
    title: item.title,
    message: item.body,
    priority: priorityMap[item.priority] ?? 'medium',
    createdAt: item.createdAt,
    isRead: item.isRead,
  }
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationStats: builder.query<NotificationStats, void>({
      query: () => ({
        tag: 'Notifications',
        url: '/analytics-cards/notifications',
        mockResolver: () => mockDelay(mockNotificationStats),
      }),
      transformResponse: (
        response: NotificationStatsApiResponse | NotificationStats,
      ) => ('data' in response ? response.data : response),
      providesTags: [{ type: 'Notifications', id: 'STATS' }],
    }),

    getNotifications: builder.query<AppNotification[], void>({
      query: () => ({
        tag: 'Notifications',
        url: '/notifications',
        mockResolver: () => mockDelay(mockNotifications),
      }),
      transformResponse: (
        response: NotificationsListApiResponse | AppNotification[],
      ) =>
        Array.isArray(response)
          ? response
          : response.data.items.map(mapApiNotification),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notifications' as const, id })),
              { type: 'Notifications' as const, id: 'LIST' },
            ]
          : [{ type: 'Notifications' as const, id: 'LIST' }],
    }),

    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Notifications',
        url: `/notifications/${id}/read`,
        method: 'PATCH',
        mockResolver: () => mockDelay(undefined),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Notifications', id },
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'STATS' },
      ],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        tag: 'Notifications',
        url: '/notifications/read-all',
        method: 'PATCH',
        mockResolver: () => mockDelay(undefined),
      }),
      invalidatesTags: [
        { type: 'Notifications', id: 'LIST' },
        { type: 'Notifications', id: 'STATS' },
      ],
    }),
  }),
})

export const {
  useGetNotificationStatsQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi
