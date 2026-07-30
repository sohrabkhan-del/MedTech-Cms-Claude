// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockProductCategories,
  getProductCategoryById,
  getParentCategoryName,
  topLevelCategoryOptions,
  productCategoryKpis,
} from '@/features/masters/mockMasters'
import type { ProductCategory, ProductCategoryFormValues } from '@/features/masters/types/masters.types'
import { mockDelay } from '@/services/mockDelay'

// create/update are currently no-ops resolving immediately so the UI/hook
// contract is stable ahead of the real API.

const productCategoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductCategories: builder.query<ProductCategory[], void>({
      query: () => ({
        tag: 'ProductCategories',
        url: '/product-categories',
        mockResolver: () => mockDelay(mockProductCategories),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ProductCategories' as const, id })),
              { type: 'ProductCategories' as const, id: 'LIST' },
            ]
          : [{ type: 'ProductCategories' as const, id: 'LIST' }],
    }),

    getProductCategoryDetail: builder.query<ProductCategory | undefined, string>({
      query: (id) => ({
        tag: 'ProductCategories',
        url: `/product-categories/${id}`,
        mockResolver: () => mockDelay(getProductCategoryById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'ProductCategories', id }],
    }),

    getProductCategoryKpis: builder.query<typeof productCategoryKpis, void>({
      query: () => ({
        tag: 'ProductCategories',
        url: '/product-categories/kpis',
        mockResolver: () => mockDelay(productCategoryKpis),
      }),
      providesTags: [{ type: 'ProductCategories', id: 'KPIS' }],
    }),

    getParentCategoryOptions: builder.query<ProductCategory[], string | undefined>({
      query: (excludeId) => ({
        tag: 'ProductCategories',
        url: '/product-categories/parent-options',
        params: { excludeId },
        mockResolver: () => mockDelay(mockProductCategories.filter((category) => category.id !== excludeId)),
      }),
      providesTags: [{ type: 'ProductCategories', id: 'PARENT_OPTIONS' }],
    }),

    getTopLevelCategoryOptions: builder.query<ProductCategory[], void>({
      query: () => ({
        tag: 'ProductCategories',
        url: '/product-categories/top-level-options',
        mockResolver: () => mockDelay(topLevelCategoryOptions),
      }),
      providesTags: [{ type: 'ProductCategories', id: 'TOP_LEVEL_OPTIONS' }],
    }),

    createProductCategory: builder.mutation<void, ProductCategoryFormValues>({
      query: (values) => ({
        tag: 'ProductCategories',
        url: '/product-categories',
        method: 'POST',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [{ type: 'ProductCategories', id: 'LIST' }, { type: 'ProductCategories', id: 'KPIS' }],
    }),

    updateProductCategory: builder.mutation<void, { id: string; values: ProductCategoryFormValues }>({
      query: ({ id, values }) => ({
        tag: 'ProductCategories',
        url: `/product-categories/${id}`,
        method: 'PUT',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ProductCategories', id },
        { type: 'ProductCategories', id: 'LIST' },
        { type: 'ProductCategories', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetProductCategoriesQuery,
  useGetProductCategoryDetailQuery,
  useGetProductCategoryKpisQuery,
  useGetParentCategoryOptionsQuery,
  useGetTopLevelCategoryOptionsQuery,
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
} = productCategoriesApi

/** Non-async helper retained as-is; not a network call, no RTK Query wrapper needed. */
export function resolveParentCategoryName(parentCategoryId?: string): string | undefined {
  return getParentCategoryName(parentCategoryId)
}
