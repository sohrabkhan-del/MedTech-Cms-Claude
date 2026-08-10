import { baseApi } from '@/store/api/baseApi'
import {
  mockProducts,
  getProductById,
  productKpis,
  productCategoryOptions,
  productFromImportedRow,
} from '@/features/inventoryManagement/mockProducts'
import type {
  Product,
  ProductFormValues,
} from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { ProductCategoryRef, ProductRegionConfig } from '@/types/product'
import type { ParsedImportFile } from '@/components/common/CommonTable/tableCsv'
import { mockDelay } from '@/services/mockDelay'
import { formatDate } from '@/utils/formatDate'

// create/update are currently no-ops resolving immediately so the UI/hook
// contract is stable ahead of the real API. Movement history, audit history,
// and timeline have no real backend endpoint yet — they stay mock-only.

export interface ProductQueryParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface ProductListApiResponse {
  success: boolean
  message?: string
  data: {
    items: ProductApiItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

interface ProductDetailApiResponse {
  success: boolean
  message?: string
  data: ProductApiItem
}

interface ProductRegionApiItem {
  regionId: string
  regionName: string
  dealerMultiplier: number | null
  chemistMultiplier: number | null
}

interface ProductApiItem {
  id: string
  categoryId: string
  category: { id: string; categoryCode: string; categoryName: string } | null
  productCode: string
  productName: string
  dealerContainerPoints: number
  dealerProductPoints: number
  chemistContainerPoints: number
  chemistProductPoints: number
  status: string
  regions?: ProductRegionApiItem[]
  createdAt: string
  updatedAt: string
}

function mapStatus(status: string): Product['status'] {
  return status === 'ACTIVE' ? 'active' : 'inactive'
}

function mapRegions(regions?: ProductRegionApiItem[]): ProductRegionConfig[] {
  return (regions ?? []).map((region) => ({
    regionId: region.regionId,
    regionName: region.regionName,
    dealerMultiplier: region.dealerMultiplier,
    chemistMultiplier: region.chemistMultiplier,
  }))
}

/** Maps the real /products item onto the app's richer Product shape. Fields with
 * no real backend source yet (description, images, movement/audit/timeline, etc.)
 * are defaulted empty rather than fabricated. */
function mapProductItem(item: ProductApiItem): Product {
  const category: ProductCategoryRef | null = item.category
    ? {
        id: item.category.id,
        categoryCode: item.category.categoryCode,
        categoryName: item.category.categoryName,
      }
    : null

  return {
    id: item.id,
    productName: item.productName,
    productCode: item.productCode,
    productCategory: category?.categoryName ?? '',
    categoryId: item.categoryId || undefined,
    category,
    status: mapStatus(item.status),
    uploadedDate: formatDate(item.createdAt),

    description: '',
    productImages: [],
    sku: '',
    brand: '',
    mrp: 0,
    manufacturingDetails: '',
    createdDate: formatDate(item.createdAt),
    lastUpdatedDate: formatDate(item.updatedAt),

    dealerRewardPoints: item.dealerContainerPoints + item.dealerProductPoints,
    chemistRewardPoints: item.chemistContainerPoints + item.chemistProductPoints,
    dealerContainerPoints: item.dealerContainerPoints,
    dealerProductPoints: item.dealerProductPoints,
    chemistContainerPoints: item.chemistContainerPoints,
    chemistProductPoints: item.chemistProductPoints,
    regions: mapRegions(item.regions),
    rewardConfigStatus:
      item.dealerContainerPoints + item.dealerProductPoints > 0 &&
      item.chemistContainerPoints + item.chemistProductPoints > 0
        ? 'configured'
        : 'pending',

    totalFactoryUploads: 0,
    totalQrCodesGenerated: 0,
    totalSuccessfulScans: 0,
    totalDealerAllocations: 0,
    totalChemistAllocations: 0,
    totalRewardPointsIssued: 0,
    totalSecurityAlerts: 0,
    totalShownInterest: 0,

    // No real endpoint yet — movement history stays mock-only.
    movementHistory: getProductById(item.id)?.movementHistory ?? [],
    auditHistory: [],
    timeline: [],
  }
}

function mapStatusParam(status?: string) {
  if (!status || status === 'all') return undefined
  return status === 'active' ? 'ACTIVE' : 'INACTIVE'
}

const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], ProductQueryParams | void>({
      query: (params) => ({
        tag: 'Products',
        url: '/products',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          categoryId: params?.categoryId || undefined,
          status: mapStatusParam(params?.status),
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder ?? 'desc',
        },
        mockResolver: () => mockDelay(mockProducts),
      }),
      transformResponse: (response: ProductListApiResponse | Product[]) =>
        Array.isArray(response)
          ? response
          : response.data.items.map(mapProductItem),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Products' as const, id })), { type: 'Products' as const, id: 'LIST' }]
          : [{ type: 'Products' as const, id: 'LIST' }],
    }),

    getProductDetail: builder.query<Product | undefined, string>({
      query: (id) => ({ tag: 'Products', url: `/products/${id}`, mockResolver: () => mockDelay(getProductById(id)) }),
      transformResponse: (
        response: ProductDetailApiResponse | Product | undefined,
      ) =>
        response && 'data' in response
          ? mapProductItem(response.data)
          : response,
      providesTags: (_result, _error, id) => [{ type: 'Products', id }],
    }),

    getProductKpis: builder.query<typeof productKpis, void>({
      query: () => ({
        tag: 'Products',
        url: '/analytics-cards/products',
        mockResolver: () => mockDelay(productKpis),
      }),
      transformResponse: (
        response: { success: boolean; data: typeof productKpis } | typeof productKpis,
      ) => ('data' in response ? response.data : response),
      providesTags: [{ type: 'Products', id: 'KPIS' }],
    }),

    getProductCategoryOptions: builder.query<typeof productCategoryOptions, void>({
      query: () => ({
        tag: 'Products',
        url: '/products/category-options',
        mockResolver: () => mockDelay(productCategoryOptions),
      }),
      providesTags: [{ type: 'Products', id: 'CATEGORY_OPTIONS' }],
    }),

    createProduct: builder.mutation<void, ProductFormValues>({
      query: (values) => ({
        tag: 'Products',
        url: '/products',
        method: 'POST',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }, { type: 'Products', id: 'KPIS' }],
    }),

    updateProduct: builder.mutation<void, { id: string; values: ProductFormValues }>({
      query: ({ id, values }) => ({
        tag: 'Products',
        url: `/products/${id}`,
        method: 'PUT',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
        { type: 'Products', id: 'KPIS' },
      ],
    }),

    // Maps parsed xlsx rows onto Product records for the mock store. Real imports
    // will need a backend endpoint that validates/maps columns server-side. Does not
    // invalidate the products list/KPIs tags — like the original service, imported
    // rows aren't persisted into the underlying mock store; the caller merges the
    // returned rows into local state instead (see useProducts).
    importProducts: builder.mutation<Product[], ParsedImportFile>({
      query: (parsed) => ({
        tag: 'Products',
        url: '/products/import',
        method: 'POST',
        data: parsed,
        mockResolver: () =>
          mockDelay(parsed.rows.map((row, i) => productFromImportedRow(row, mockProducts.length + i + 1))),
      }),
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductDetailQuery,
  useGetProductKpisQuery,
  useGetProductCategoryOptionsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useImportProductsMutation,
} = productsApi
