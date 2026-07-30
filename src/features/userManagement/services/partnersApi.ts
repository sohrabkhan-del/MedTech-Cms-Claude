// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import { mockDealers, getDealerById, dealerKpis } from '@/features/userManagement/mockDealers'
import { mrs } from '@/features/userManagement/mockPartnerData'
import type { Dealer, DealerFormValues } from '@/features/userManagement/types/userManagement.types'
import { mockDelay } from '@/services/mockDelay'

// create/updateDealer are currently no-ops resolving immediately so the
// UI/hook contract is stable ahead of the real API.

const partnersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDealers: builder.query<Dealer[], void>({
      query: () => ({ tag: 'Partners', url: '/dealers', mockResolver: () => mockDelay(mockDealers) }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Partners' as const, id })), { type: 'Partners' as const, id: 'LIST' }]
          : [{ type: 'Partners' as const, id: 'LIST' }],
    }),

    getDealerDetail: builder.query<Dealer | undefined, string>({
      query: (id) => ({
        tag: 'Partners',
        url: `/dealers/${id}`,
        mockResolver: () => mockDelay(getDealerById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'Partners', id }],
    }),

    getDealerKpis: builder.query<typeof dealerKpis, void>({
      query: () => ({ tag: 'Partners', url: '/dealers/kpis', mockResolver: () => mockDelay(dealerKpis) }),
      providesTags: [{ type: 'Partners', id: 'KPIS' }],
    }),

    getMrOptions: builder.query<string[], void>({
      query: () => ({ tag: 'Partners', url: '/dealers/mr-options', mockResolver: () => mockDelay(mrs) }),
      providesTags: [{ type: 'Partners', id: 'MR_OPTIONS' }],
    }),

    createDealer: builder.mutation<void, DealerFormValues>({
      query: (values) => ({
        tag: 'Partners',
        url: '/dealers',
        method: 'POST',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [{ type: 'Partners', id: 'LIST' }, { type: 'Partners', id: 'KPIS' }],
    }),

    updateDealer: builder.mutation<void, { id: string; values: DealerFormValues }>({
      query: ({ id, values }) => ({
        tag: 'Partners',
        url: `/dealers/${id}`,
        method: 'PUT',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Partners', id },
        { type: 'Partners', id: 'LIST' },
        { type: 'Partners', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetDealersQuery,
  useGetDealerDetailQuery,
  useGetDealerKpisQuery,
  useGetMrOptionsQuery,
  useCreateDealerMutation,
  useUpdateDealerMutation,
} = partnersApi
