// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockSecurityAlerts,
  getSecurityAlertById,
  getUserSecuritySummary,
  getUserAlertHistory,
  getUserSecurityTimeline,
  securityAlertKpis,
} from '@/features/fieldOperations/mocks/mockSecurityAlerts'
import type { SecurityAlert } from '@/features/fieldOperations/types/fieldOperations.types'
import type { UserSecuritySummary, SecurityTimelineEntry } from '@/types/securityAlert'
import { mockDelay } from '@/services/mockDelay'

export type SecurityAlertKpis = typeof securityAlertKpis

export interface UserSecurityProfile {
  summary: UserSecuritySummary | undefined
  alertHistory: SecurityAlert[]
  timeline: SecurityTimelineEntry[]
}

// setUserStatus is currently a no-op resolving immediately — swap for a real
// activate/deactivate endpoint once integration starts.

const securityAlertsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSecurityAlerts: builder.query<SecurityAlert[], void>({
      query: () => ({
        tag: 'SecurityAlerts',
        url: '/security-alerts',
        mockResolver: () => mockDelay(mockSecurityAlerts),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SecurityAlerts' as const, id })),
              { type: 'SecurityAlerts' as const, id: 'LIST' },
            ]
          : [{ type: 'SecurityAlerts' as const, id: 'LIST' }],
    }),

    getSecurityAlertDetail: builder.query<SecurityAlert | undefined, string>({
      query: (id) => ({
        tag: 'SecurityAlerts',
        url: `/security-alerts/${id}`,
        mockResolver: () => mockDelay(getSecurityAlertById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'SecurityAlerts', id }],
    }),

    getSecurityAlertKpis: builder.query<SecurityAlertKpis, void>({
      query: () => ({
        tag: 'SecurityAlerts',
        url: '/security-alerts/kpis',
        mockResolver: () => mockDelay(securityAlertKpis),
      }),
      providesTags: [{ type: 'SecurityAlerts', id: 'KPIS' }],
    }),

    getUserSecurityProfile: builder.query<UserSecurityProfile, string>({
      query: (userId) => ({
        tag: 'SecurityAlerts',
        url: `/security-alerts/users/${userId}`,
        mockResolver: () =>
          mockDelay({
            summary: getUserSecuritySummary(userId),
            alertHistory: getUserAlertHistory(userId),
            timeline: getUserSecurityTimeline(userId),
          }),
      }),
      providesTags: (_result, _error, userId) => [{ type: 'SecurityAlerts', id: `USER_${userId}` }],
    }),

    setUserStatus: builder.mutation<void, { userId: string; status: 'active' | 'inactive' }>({
      query: ({ userId, status }) => ({
        tag: 'SecurityAlerts',
        url: `/security-alerts/users/${userId}/status`,
        method: 'PATCH',
        data: { status },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'SecurityAlerts', id: `USER_${userId}` }],
    }),
  }),
})

export const {
  useGetSecurityAlertsQuery,
  useGetSecurityAlertDetailQuery,
  useGetSecurityAlertKpisQuery,
  useGetUserSecurityProfileQuery,
  useSetUserStatusMutation,
} = securityAlertsApi
