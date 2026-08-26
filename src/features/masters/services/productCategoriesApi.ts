import { baseApi } from '@/store/api/baseApi'
import {
  mockProductCategories,
  getProductCategoryById,
  getParentCategoryName,
  topLevelCategoryOptions,
} from '@/features/masters/mockMasters'
import type {
  ProductCategory,
  ProductCategoryFormValues,
} from '@/features/masters/types/masters.types'
import { mockDelay } from '@/services/mockDelay'

// create/update are currently no-ops resolving immediately so the UI/hook
// contract is stable ahead of the real API.

interface CategoryListApiResponse {
  success: boolean
  data: {
    items: CategoryApiItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

interface CategoryApiItem {
  id: string
  code: string
  name: string
  status: string
  createdAt: string
  updatedAt: string
}

function mapStatus(status: string): ProductCategory['status'] {
  return status === 'ACTIVE' ? 'active' : 'inactive'
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function mapCategoryItem(item: CategoryApiItem): ProductCategory {
  return {
    id: item.id,
    categoryName: item.name,
    categoryCode: item.code,
    image: '',
    description: '',
    status: mapStatus(item.status),
    createdDate: formatDate(item.createdAt),
    totalProducts: 0,
    activeSchemesCount: 0,
    totalRewardPointsIssued: 0,
    totalScans: 0,
    products: [],
    activeSchemes: [],
  }
}

function mapStatusParam(status?: string) {
  if (!status || status === 'all') return undefined
  return status === 'active' ? 'ACTIVE' : 'INACTIVE'
}

export interface ProductCategoryQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/** Paginated list result: the mapped page of categories plus the server's
 *  grand total (`totalItems`) so the table can show the true count, not just
 *  the current page's length. */
export interface ProductCategoryListResult {
  items: ProductCategory[]
  totalItems: number
}

const productCategoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductCategories: builder.query<
      ProductCategoryListResult,
      ProductCategoryQueryParams | void
    >({
      query: (params) => ({
        tag: 'ProductCategories',
        url: '/categories',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          status: mapStatusParam(params?.status),
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder ?? 'desc',
        },
        mockResolver: () => mockDelay(mockProductCategories),
      }),
      transformResponse: (
        response: CategoryListApiResponse | ProductCategory[],
      ): ProductCategoryListResult =>
        Array.isArray(response)
          ? { items: response, totalItems: response.length }
          : {
              items: response.data.items.map(mapCategoryItem),
              totalItems: response.data.totalItems,
            },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: 'ProductCategories' as const,
                id,
              })),
              { type: 'ProductCategories' as const, id: 'LIST' },
            ]
          : [{ type: 'ProductCategories' as const, id: 'LIST' }],
    }),

    getProductCategoryDetail: builder.query<
      ProductCategory | undefined,
      string
    >({
      query: (id) => ({
        tag: 'ProductCategories',
        url: `/product-categories/${id}`,
        mockResolver: () => mockDelay(getProductCategoryById(id)),
      }),
      providesTags: (_result, _error, id) => [
        { type: 'ProductCategories', id },
      ],
    }),

    getParentCategoryOptions: builder.query<
      ProductCategory[],
      string | undefined
    >({
      query: (excludeId) => ({
        tag: 'ProductCategories',
        url: '/product-categories/parent-options',
        params: { excludeId },
        mockResolver: () =>
          mockDelay(
            mockProductCategories.filter(
              (category) => category.id !== excludeId,
            ),
          ),
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
      invalidatesTags: [{ type: 'ProductCategories', id: 'LIST' }],
    }),

    updateProductCategory: builder.mutation<
      void,
      { id: string; values: ProductCategoryFormValues }
    >({
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
      ],
    }),
  }),
})

export const {
  useGetProductCategoriesQuery,
  useGetProductCategoryDetailQuery,
  useGetParentCategoryOptionsQuery,
  useGetTopLevelCategoryOptionsQuery,
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
} = productCategoriesApi

/** Non-async helper retained as-is; not a network call, no RTK Query wrapper needed. */
export function resolveParentCategoryName(
  parentCategoryId?: string,
): string | undefined {
  return getParentCategoryName(parentCategoryId)
}
