import { baseApi } from '@/store/api/baseApi'
import {
  mockShowcaseProducts,
  getShowcaseProductById,
  showcaseProductKpis,
  showcaseCategoryOptions,
} from '@/features/marketingProducts/mockShowcaseProducts'
import type {
  ShowcaseProduct,
  ShowcaseVisibility,
} from '@/types/showcaseProduct'
import type { ShowcaseProductApiPayload } from '@/features/marketingProducts/showcaseProductFormSchema'
import { mockDelay } from '@/services/mockDelay'
import type { AnalyticsDateParams } from '@/utils/dateRangeToAnalyticsParams'

export interface ShowcaseProductKpis {
  totalProducts: number
  activeProducts: number
  productsEnquiredFor: number
  totalPendingEnquiries: number
}

export interface ShowcaseProductQueryParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string | 'all'
  visibleTo?: ShowcaseVisibility | 'all'
  status?: 'active' | 'inactive' | 'all'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  preset?: string
  startDate?: string
  endDate?: string
}

interface ShowcaseProductApiItem {
  id: string
  productCode: string
  name: string
  description: string
  categoryId?: string | null
  category: { id: string; code: string; name: string } | null
  images: { url: string; alt?: string; isPrimary?: boolean }[]
  mrp: number
  dealerPrice: number
  chemistPrice: number
  availableStock?: number
  stockUnit?: string
  lowStockThreshold?: number
  isActive: boolean
  visibleTo: ShowcaseVisibility[]
  createdAt: string
  updatedAt: string
}

interface ShowcaseProductListApiResponse {
  success: boolean
  data: {
    items: ShowcaseProductApiItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

interface ShowcaseProductDetailApiResponse {
  success: boolean
  data: ShowcaseProductApiItem
}

interface ShowcaseProductKpisApiResponse {
  success: boolean
  data: ShowcaseProductKpis
}

export interface CategoryOption {
  id: string
  name: string
}

export interface CategoryOptionsQueryParams {
  page: number
  limit: number
  search?: string
}

export interface CategoryOptionsPage {
  items: CategoryOption[]
  hasMore: boolean
}

interface CategoryListApiResponse {
  success: boolean
  data: {
    items: { id: string; name: string }[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

function mapShowcaseProductItem(item: ShowcaseProductApiItem): ShowcaseProduct {
  return {
    id: item.id,
    productCode: item.productCode,
    name: item.name,
    description: item.description,
    categoryId: item.category?.id ?? item.categoryId ?? null,
    category: item.category,
    brand: '',
    images: item.images,
    mrp: item.mrp,
    dealerPrice: item.dealerPrice,
    chemistPrice: item.chemistPrice,
    availableStock: item.availableStock,
    stockUnit: item.stockUnit,
    lowStockThreshold: item.lowStockThreshold,
    isActive: item.isActive,
    visibleTo: item.visibleTo,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function mapStatusParam(status?: 'active' | 'inactive' | 'all') {
  if (!status || status === 'all') return undefined
  return status === 'active'
}

function filterMockProducts(
  params?: ShowcaseProductQueryParams,
): ShowcaseProduct[] {
  return mockShowcaseProducts.filter((product) => {
    const searchMatch =
      !params?.search ||
      product.name.toLowerCase().includes(params.search.toLowerCase()) ||
      product.productCode.toLowerCase().includes(params.search.toLowerCase())
    const categoryMatch =
      !params?.categoryId ||
      params.categoryId === 'all' ||
      params.categoryId.split(',').includes(product.categoryId ?? '')
    const visibleToMatch =
      !params?.visibleTo ||
      params.visibleTo === 'all' ||
      product.visibleTo.includes(params.visibleTo)
    const statusMatch =
      !params?.status ||
      params.status === 'all' ||
      (params.status === 'active' ? product.isActive : !product.isActive)
    return searchMatch && categoryMatch && visibleToMatch && statusMatch
  })
}

const showcaseProductsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShowcaseProducts: builder.query<
      { items: ShowcaseProduct[]; totalItems: number },
      ShowcaseProductQueryParams | void
    >({
      query: (params) => ({
        tag: 'ShowcaseProducts',
        url: '/showcase-products',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          categoryId:
            params?.categoryId && params.categoryId !== 'all'
              ? params.categoryId
              : undefined,
          visibleTo:
            params?.visibleTo && params.visibleTo !== 'all'
              ? params.visibleTo
              : undefined,
          isActive: mapStatusParam(params?.status),
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder ?? 'desc',
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () =>
          mockDelay(
            (() => {
              const items = filterMockProducts(params ?? undefined)
              return { items, totalItems: items.length }
            })(),
          ),
      }),
      transformResponse: (
        response:
          | ShowcaseProductListApiResponse
          | ShowcaseProduct[]
          | { items: ShowcaseProduct[]; totalItems: number },
      ) =>
        Array.isArray(response)
          ? {
              items: response.map(mapShowcaseProductItem),
              totalItems: response.length,
            }
          : 'data' in response
            ? {
                items: response.data.items.map(mapShowcaseProductItem),
                totalItems: response.data.totalItems,
              }
            : {
                items: response.items.map(mapShowcaseProductItem),
                totalItems: response.totalItems,
              },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: 'ShowcaseProducts' as const,
                id,
              })),
              { type: 'ShowcaseProducts' as const, id: 'LIST' },
            ]
          : [{ type: 'ShowcaseProducts' as const, id: 'LIST' }],
    }),

    getShowcaseProductDetail: builder.query<
      ShowcaseProduct | undefined,
      string
    >({
      query: (id) => ({
        tag: 'ShowcaseProducts',
        url: `/showcase-products/${id}`,
        mockResolver: () => mockDelay(getShowcaseProductById(id)),
      }),
      transformResponse: (
        response:
          ShowcaseProductDetailApiResponse | ShowcaseProduct | undefined,
      ) =>
        response && 'data' in response
          ? mapShowcaseProductItem(response.data)
          : response,
      providesTags: (_result, _error, id) => [{ type: 'ShowcaseProducts', id }],
    }),

    getShowcaseProductKpis: builder.query<
      ShowcaseProductKpis,
      AnalyticsDateParams | void
    >({
      query: (params) => ({
        tag: 'ShowcaseProducts',
        url: '/analytics-cards/showcase-products',
        params: {
          preset: params?.preset,
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
        mockResolver: () => mockDelay(showcaseProductKpis),
      }),
      transformResponse: (
        response: ShowcaseProductKpisApiResponse | ShowcaseProductKpis,
      ) => ('data' in response ? response.data : response),
      providesTags: [{ type: 'ShowcaseProducts', id: 'KPIS' }],
    }),

    /**
     * Lazy-loaded category options for the product form's Category dropdown.
     * Cache entries are keyed by search term only (not page); each page
     * fetched for a given search is appended via `merge` so the Autocomplete
     * can keep growing the list as the user scrolls.
     */
    getCategoryOptions: builder.query<
      CategoryOptionsPage,
      CategoryOptionsQueryParams
    >({
      query: (params) => ({
        tag: 'ProductCategories',
        url: '/categories',
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search || undefined,
          sortBy: 'name',
          sortOrder: 'desc',
        },
        mockResolver: () =>
          mockDelay(
            (() => {
              const filtered = params.search
                ? showcaseCategoryOptions.filter((name) =>
                    name.toLowerCase().includes(params.search!.toLowerCase()),
                  )
                : showcaseCategoryOptions
              const start = (params.page - 1) * params.limit
              const items = filtered
                .slice(start, start + params.limit)
                .map((name) => ({ id: name, name }))
              return { items, hasMore: start + params.limit < filtered.length }
            })(),
          ),
      }),
      transformResponse: (
        response: CategoryListApiResponse | CategoryOptionsPage,
      ) => {
        if ('items' in response) return response
        return {
          items: response.data.items,
          hasMore: response.data.currentPage < response.data.totalPages,
        }
      },
      serializeQueryArgs: ({ queryArgs }) => queryArgs.search ?? '',
      merge: (cache, incoming, { arg }) => {
        if (arg.page === 1) {
          cache.items = incoming.items
        } else {
          const existingIds = new Set(cache.items.map((item) => item.id))
          cache.items.push(
            ...incoming.items.filter((item) => !existingIds.has(item.id)),
          )
        }
        cache.hasMore = incoming.hasMore
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page ||
        currentArg?.search !== previousArg?.search,
      providesTags: [{ type: 'ProductCategories', id: 'OPTIONS' }],
    }),

    createShowcaseProduct: builder.mutation<void, ShowcaseProductApiPayload>({
      query: (payload) => ({
        tag: 'ShowcaseProducts',
        url: '/showcase-products',
        method: 'POST',
        data: payload,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [
        { type: 'ShowcaseProducts', id: 'LIST' },
        { type: 'ShowcaseProducts', id: 'KPIS' },
      ],
    }),

    updateShowcaseProduct: builder.mutation<
      void,
      { id: string; payload: ShowcaseProductApiPayload }
    >({
      query: ({ id, payload }) => ({
        tag: 'ShowcaseProducts',
        url: `/showcase-products/${id}`,
        method: 'PUT',
        data: payload,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ShowcaseProducts', id },
        { type: 'ShowcaseProducts', id: 'LIST' },
        { type: 'ShowcaseProducts', id: 'KPIS' },
      ],
    }),

    deleteShowcaseProduct: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'ShowcaseProducts',
        url: `/showcase-products/${id}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ShowcaseProducts', id },
        { type: 'ShowcaseProducts', id: 'LIST' },
        { type: 'ShowcaseProducts', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetShowcaseProductsQuery,
  useGetShowcaseProductDetailQuery,
  useGetShowcaseProductKpisQuery,
  useGetCategoryOptionsQuery,
  useCreateShowcaseProductMutation,
  useUpdateShowcaseProductMutation,
  useDeleteShowcaseProductMutation,
} = showcaseProductsApi
