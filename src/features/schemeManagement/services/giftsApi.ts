// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockGifts,
  getGiftById,
  giftCatalogueKpis,
  giftCategoryOptions,
  giftBrandOptions,
  giftEligibilityOptions,
  resolveStockStatus,
} from '@/features/schemeManagement/mockGifts'
import type { Gift, GiftFormValues, StockStatus } from '@/features/schemeManagement/types/schemeManagement.types'
import { mockDelay } from '@/services/mockDelay'

export interface GiftFormOptions {
  giftCategoryOptions: string[]
  giftBrandOptions: string[]
  giftEligibilityOptions: string[]
}

// create/update/setStatus/deleteGift are currently no-ops resolving
// immediately so the UI/hook contract is stable ahead of the real API.

const giftsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGifts: builder.query<Gift[], void>({
      query: () => ({ tag: 'Gifts', url: '/gifts', mockResolver: () => mockDelay(mockGifts) }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Gifts' as const, id })), { type: 'Gifts' as const, id: 'LIST' }]
          : [{ type: 'Gifts' as const, id: 'LIST' }],
    }),

    getGiftDetail: builder.query<Gift | undefined, string>({
      query: (id) => ({ tag: 'Gifts', url: `/gifts/${id}`, mockResolver: () => mockDelay(getGiftById(id)) }),
      providesTags: (_result, _error, id) => [{ type: 'Gifts', id }],
    }),

    getGiftCatalogueKpis: builder.query<typeof giftCatalogueKpis, void>({
      query: () => ({ tag: 'Gifts', url: '/gifts/kpis', mockResolver: () => mockDelay(giftCatalogueKpis) }),
      providesTags: [{ type: 'Gifts', id: 'KPIS' }],
    }),

    getGiftFormOptions: builder.query<GiftFormOptions, void>({
      query: () => ({
        tag: 'Gifts',
        url: '/gifts/form-options',
        mockResolver: () => mockDelay({ giftCategoryOptions, giftBrandOptions, giftEligibilityOptions }),
      }),
      providesTags: [{ type: 'Gifts', id: 'FORM_OPTIONS' }],
    }),

    createGift: builder.mutation<void, GiftFormValues>({
      query: (values) => ({
        tag: 'Gifts',
        url: '/gifts',
        method: 'POST',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [{ type: 'Gifts', id: 'LIST' }, { type: 'Gifts', id: 'KPIS' }],
    }),

    updateGift: builder.mutation<void, { id: string; values: GiftFormValues }>({
      query: ({ id, values }) => ({
        tag: 'Gifts',
        url: `/gifts/${id}`,
        method: 'PUT',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Gifts', id },
        { type: 'Gifts', id: 'LIST' },
        { type: 'Gifts', id: 'KPIS' },
      ],
    }),

    setGiftStatus: builder.mutation<void, { id: string; status: Gift['status'] }>({
      query: ({ id, status }) => ({
        tag: 'Gifts',
        url: `/gifts/${id}/status`,
        method: 'PATCH',
        data: { status },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Gifts', id }, { type: 'Gifts', id: 'LIST' }],
    }),

    deleteGift: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Gifts',
        url: `/gifts/${id}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Gifts', id },
        { type: 'Gifts', id: 'LIST' },
        { type: 'Gifts', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetGiftsQuery,
  useGetGiftDetailQuery,
  useGetGiftCatalogueKpisQuery,
  useGetGiftFormOptionsQuery,
  useCreateGiftMutation,
  useUpdateGiftMutation,
  useSetGiftStatusMutation,
  useDeleteGiftMutation,
} = giftsApi

/** Non-async helper retained as-is; not a network call, no RTK Query wrapper needed. */
export function getGiftStockStatus(gift: Gift): StockStatus {
  return resolveStockStatus(gift)
}
