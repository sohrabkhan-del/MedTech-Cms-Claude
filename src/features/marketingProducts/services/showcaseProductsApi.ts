// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockShowcaseProducts,
  getShowcaseProductById,
  showcaseProductKpis,
  showcaseCategoryOptions,
} from '@/features/marketingProducts/mockShowcaseProducts'
import type { ShowcaseProduct, ShowcaseProductFormValues } from '@/features/marketingProducts/types/marketingProducts.types'
import { mockDelay } from '@/services/mockDelay'

// create/update/markEnquiryResponded are currently no-ops resolving
// immediately so the UI/hook contract is stable ahead of time.

const showcaseProductsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShowcaseProducts: builder.query<ShowcaseProduct[], void>({
      query: () => ({
        tag: 'ShowcaseProducts',
        url: '/showcase-products',
        mockResolver: () => mockDelay(mockShowcaseProducts),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ShowcaseProducts' as const, id })),
              { type: 'ShowcaseProducts' as const, id: 'LIST' },
            ]
          : [{ type: 'ShowcaseProducts' as const, id: 'LIST' }],
    }),

    getShowcaseProductDetail: builder.query<ShowcaseProduct | undefined, string>({
      query: (id) => ({
        tag: 'ShowcaseProducts',
        url: `/showcase-products/${id}`,
        mockResolver: () => mockDelay(getShowcaseProductById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'ShowcaseProducts', id }],
    }),

    getShowcaseProductKpis: builder.query<typeof showcaseProductKpis, void>({
      query: () => ({
        tag: 'ShowcaseProducts',
        url: '/showcase-products/kpis',
        mockResolver: () => mockDelay(showcaseProductKpis),
      }),
      providesTags: [{ type: 'ShowcaseProducts', id: 'KPIS' }],
    }),

    getShowcaseCategoryOptions: builder.query<string[], void>({
      query: () => ({
        tag: 'ShowcaseProducts',
        url: '/showcase-products/category-options',
        mockResolver: () => mockDelay(showcaseCategoryOptions),
      }),
      providesTags: [{ type: 'ShowcaseProducts', id: 'CATEGORY_OPTIONS' }],
    }),

    createShowcaseProduct: builder.mutation<void, ShowcaseProductFormValues>({
      query: (values) => ({
        tag: 'ShowcaseProducts',
        url: '/showcase-products',
        method: 'POST',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [{ type: 'ShowcaseProducts', id: 'LIST' }, { type: 'ShowcaseProducts', id: 'KPIS' }],
    }),

    updateShowcaseProduct: builder.mutation<void, { id: string; values: ShowcaseProductFormValues }>({
      query: ({ id, values }) => ({
        tag: 'ShowcaseProducts',
        url: `/showcase-products/${id}`,
        method: 'PUT',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ShowcaseProducts', id },
        { type: 'ShowcaseProducts', id: 'LIST' },
        { type: 'ShowcaseProducts', id: 'KPIS' },
      ],
    }),

    markEnquiryResponded: builder.mutation<void, string>({
      query: (enquiryId) => ({
        tag: 'ShowcaseProducts',
        url: `/showcase-products/enquiries/${enquiryId}/respond`,
        method: 'PATCH',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [{ type: 'ShowcaseProducts', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetShowcaseProductsQuery,
  useGetShowcaseProductDetailQuery,
  useGetShowcaseProductKpisQuery,
  useGetShowcaseCategoryOptionsQuery,
  useCreateShowcaseProductMutation,
  useUpdateShowcaseProductMutation,
  useMarkEnquiryRespondedMutation,
} = showcaseProductsApi
