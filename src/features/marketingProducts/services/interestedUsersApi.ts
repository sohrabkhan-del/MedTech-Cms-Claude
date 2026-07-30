// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import { mockInterestedUsers, getInterestedUserById, interestedUserKpis } from '@/features/marketingProducts/mockInterestedUsers'
import { mrs } from '@/features/userManagement/mockPartnerData'
import type { InterestedUserLead, LeadStatus } from '@/features/marketingProducts/types/marketingProducts.types'
import { mockDelay } from '@/services/mockDelay'

// setLeadStatus/deleteLead are currently no-ops resolving immediately so the
// UI/hook contract is stable ahead of the real API.

const interestedUsersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInterestedUsers: builder.query<InterestedUserLead[], void>({
      query: () => ({
        tag: 'InterestedUsers',
        url: '/interested-users',
        mockResolver: () => mockDelay(mockInterestedUsers),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'InterestedUsers' as const, id })),
              { type: 'InterestedUsers' as const, id: 'LIST' },
            ]
          : [{ type: 'InterestedUsers' as const, id: 'LIST' }],
    }),

    getInterestedUserDetail: builder.query<InterestedUserLead | undefined, string>({
      query: (id) => ({
        tag: 'InterestedUsers',
        url: `/interested-users/${id}`,
        mockResolver: () => mockDelay(getInterestedUserById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'InterestedUsers', id }],
    }),

    getInterestedUserKpis: builder.query<typeof interestedUserKpis, void>({
      query: () => ({
        tag: 'InterestedUsers',
        url: '/interested-users/kpis',
        mockResolver: () => mockDelay(interestedUserKpis),
      }),
      providesTags: [{ type: 'InterestedUsers', id: 'KPIS' }],
    }),

    getHandlerOptions: builder.query<string[], void>({
      query: () => ({
        tag: 'InterestedUsers',
        url: '/interested-users/handler-options',
        mockResolver: () => mockDelay(mrs),
      }),
      providesTags: [{ type: 'InterestedUsers', id: 'HANDLER_OPTIONS' }],
    }),

    setLeadStatus: builder.mutation<void, { id: string; status: LeadStatus }>({
      query: ({ id, status }) => ({
        tag: 'InterestedUsers',
        url: `/interested-users/${id}/status`,
        method: 'PATCH',
        data: { status },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'InterestedUsers', id },
        { type: 'InterestedUsers', id: 'LIST' },
      ],
    }),

    deleteLead: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'InterestedUsers',
        url: `/interested-users/${id}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'InterestedUsers', id },
        { type: 'InterestedUsers', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetInterestedUsersQuery,
  useGetInterestedUserDetailQuery,
  useGetInterestedUserKpisQuery,
  useGetHandlerOptionsQuery,
  useSetLeadStatusMutation,
  useDeleteLeadMutation,
} = interestedUsersApi
