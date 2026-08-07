import { baseApi } from '@/store/api/baseApi'
import { mockDelay } from '@/services/mockDelay'

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
  }),
})

export const { useGetNotificationStatsQuery } = notificationsApi
