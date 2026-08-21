import { baseApi } from '@/store/api/baseApi'
import type { UserSession } from '@/features/systemUsers/types/session.types'
import { mockDelay } from '@/services/mockDelay'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

let mockSessions: UserSession[] = [
  {
    id: "fac24962-87fc-4ef6-99ef-c563fc1af741",
    userId: "aee0ad83-8bf5-4e10-a04d-589c59df7ba7",
    userType: "CHEMIST",
    sessionId: "sess_d0624693-2ef1-49dc-8dee-55cad35a7b0b",
    accessJti: "access_4d29f71e-a8c8-48f7-95b1-4ee55dee464f",
    refreshJti: "refresh_70060a70-40f9-4554-a579-33f8c10bbca8",
    deviceId: "dev_macbook",
    platform: "macOS",
    appVersion: "2.1.0",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    ipAddress: "103.45.67.89",
    status: "ACTIVE",
    issuedAt: "2026-08-21T09:30:00.000Z",
    lastSeenAt: "2026-08-21T12:45:00.000Z",
    expiresAt: "2026-08-28T09:30:00.000Z",
    revokedAt: null,
    revokedReason: "",
    isCurrent: true,
    isDeleted: false,
    createdAt: "2026-08-21T09:30:00.000Z",
    updatedAt: "2026-08-21T12:45:00.000Z"
  },
  {
    id: "0a1b2bfe-3302-4166-950f-957a1e19b70a",
    userId: "aee0ad83-8bf5-4e10-a04d-589c59df7ba7",
    userType: "CHEMIST",
    sessionId: "sess_559a4ce3-115e-4f23-8d93-c2c69bc11bf2",
    accessJti: "access_8eb13415-50b9-4b9e-abbb-2a83c6b56945",
    refreshJti: "refresh_a89ffb3e-bcc7-4e6a-8e83-1c27a371f39e",
    deviceId: "dev_iphone",
    platform: "iOS",
    appVersion: "2.0.5",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) Mobile/15E148",
    ipAddress: "49.36.88.10",
    status: "ACTIVE",
    issuedAt: "2026-08-20T11:46:04.343Z",
    lastSeenAt: "2026-08-20T11:46:04.343Z",
    expiresAt: "2026-08-27T11:46:04.343Z",
    revokedAt: null,
    revokedReason: "",
    isCurrent: false,
    isDeleted: false,
    createdAt: "2026-08-20T11:46:04.346Z",
    updatedAt: "2026-08-20T11:46:04.383Z"
  }
]

export const sessionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserSessions: builder.query<UserSession[], string>({
      query: (userId) => ({
        tag: 'Sessions',
        url: `/auth/admin/users/${userId}/sessions`,
        mockResolver: () => {
          // Normalize to return mock list for testing/fallbacks
          const sessions = mockSessions.map(s => ({ ...s, userId }))
          return mockDelay(sessions)
        },
      }),
      transformResponse: (response: ApiResponse<UserSession[]> | UserSession[]) => {
        return Array.isArray(response) ? response : response.data
      },
      providesTags: (result, _error, userId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Sessions' as const, id })),
              { type: 'Sessions' as const, id: `LIST_${userId}` },
            ]
          : [{ type: 'Sessions' as const, id: `LIST_${userId}` }],
    }),

    revokeUserSession: builder.mutation<void, { userId: string; sessionId: string }>({
      query: ({ userId, sessionId }) => ({
        tag: 'Sessions',
        url: `/auth/admin/users/${userId}/sessions/${sessionId}/revoke`,
        method: 'POST',
        mockResolver: () => {
          mockSessions = mockSessions.filter(s => s.sessionId !== sessionId)
          return Promise.resolve()
        },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'Sessions', id: `LIST_${userId}` }
      ],
    }),

    revokeAllUserSessions: builder.mutation<void, string>({
      query: (userId) => ({
        tag: 'Sessions',
        url: `/auth/admin/users/${userId}/sessions/revoke-all`,
        method: 'POST',
        mockResolver: () => {
          mockSessions = []
          return Promise.resolve()
        },
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'Sessions', id: `LIST_${userId}` }
      ],
    }),
  }),
})

export const {
  useGetUserSessionsQuery,
  useRevokeUserSessionMutation,
  useRevokeAllUserSessionsMutation,
} = sessionsApi
