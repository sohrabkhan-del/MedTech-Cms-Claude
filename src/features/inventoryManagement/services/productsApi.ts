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
import type {
  MovementScannedStatus,
  ProductCategoryRef,
  ProductMovementEntry,
  ProductRegionConfig,
} from '@/types/product'
import type { ParsedImportFile } from '@/components/common/CommonTable/tableCsv'
import { mockDelay } from '@/services/mockDelay'
import { formatDate } from '@/utils/formatDate'
import type { AnalyticsDateParams } from '@/utils/dateRangeToAnalyticsParams'

// create/update are currently no-ops resolving immediately so the UI/hook
// contract is stable ahead of the real API. Movement history, audit history,
// and timeline have no real backend endpoint yet — they stay mock-only.

export interface ProductQueryParams extends Partial<AnalyticsDateParams> {
  page?: number
  limit?: number
  search?: string
  regionId?: string
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

/** Paginated list result: the mapped page of products plus the server's grand
 *  total (`totalItems`) so the table's count reflects all matches, not just
 *  the current page. */
export interface ProductListResult {
  items: Product[]
  totalItems: number
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
  category: {
    id: string
    categoryCode?: string
    categoryName?: string
    code?: string
    name?: string
  } | null
  productCode: string
  productName: string
  dealerContainerPoints: number
  dealerProductPoints: number
  chemistContainerPoints: number
  chemistProductPoints: number
  status: string
  totalQuantity?: number
  totalScanQuantity?: number
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
        categoryCode: item.category.categoryCode ?? item.category.code ?? '',
        categoryName: item.category.categoryName ?? item.category.name ?? '',
      }
    : null

  const productName = item.productName || item.productCode || item.id

  return {
    id: item.id,
    productName,
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

    dealerRewardPoints: item.dealerProductPoints,
    chemistRewardPoints: item.chemistProductPoints,
    dealerContainerPoints: item.dealerContainerPoints,
    dealerProductPoints: item.dealerProductPoints,
    chemistContainerPoints: item.chemistContainerPoints,
    chemistProductPoints: item.chemistProductPoints,
    regions: mapRegions(item.regions),
    totalQuantity: item.totalQuantity ?? 0,
    totalScanQuantity: item.totalScanQuantity ?? 0,
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

export interface ProductMovementHistoryQueryParams {
  id: string
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface ProductMovementApiItem {
  id: string
  batchNo: string
  createdAt: string
  scannedStatus: string
  quantity: number
  startSerialNo: number
  endSerialNo: number
  containerStartSerialNo: number
  containerEndSerialNo: number
}

interface ProductMovementHistoryApiResponse {
  success: boolean
  message?: string
  data: {
    items: ProductMovementApiItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

function mapMovementScannedStatus(status: string): MovementScannedStatus {
  return status === 'COMPLETED' ? 'completed' : 'pending'
}

function mapProductMovementItem(
  item: ProductMovementApiItem,
): ProductMovementEntry {
  return {
    id: item.id,
    factoryUploadBatch: item.batchNo,
    quantityUploaded: item.quantity,
    startSerialNo: String(item.startSerialNo),
    endSerialNo: String(item.endSerialNo),
    containerStartSerialNo: String(item.containerStartSerialNo),
    containerEndSerialNo: String(item.containerEndSerialNo),
    scannedStatus: mapMovementScannedStatus(item.scannedStatus),
  }
}

function mapStatusParam(status?: string) {
  if (!status || status === 'all') return undefined
  return status === 'active' ? 'ACTIVE' : 'INACTIVE'
}

function normalizeProductListResponse(
  response: ProductListApiResponse | Product[] | undefined | null,
): ProductListResult {
  if (!response) return { items: [], totalItems: 0 }

  if (Array.isArray(response)) {
    const looksMapped =
      response.length > 0 &&
      typeof response[0] === 'object' &&
      response[0] !== null &&
      'productName' in response[0] &&
      'productCode' in response[0] &&
      'uploadedDate' in response[0]

    return looksMapped
      ? { items: response as Product[], totalItems: response.length }
      : {
          items: response.map((item) =>
            mapProductItem(item as unknown as ProductApiItem),
          ),
          totalItems: response.length,
        }
  }

  const payload = 'data' in response ? response.data : response

  if (Array.isArray(payload)) {
    const looksMapped =
      payload.length > 0 &&
      typeof payload[0] === 'object' &&
      payload[0] !== null &&
      'productName' in payload[0] &&
      'productCode' in payload[0] &&
      'uploadedDate' in payload[0]

    return looksMapped
      ? { items: payload as Product[], totalItems: payload.length }
      : {
          items: payload.map((item) => mapProductItem(item as ProductApiItem)),
          totalItems: payload.length,
        }
  }

  if (payload && typeof payload === 'object') {
    const payloadRecord = payload as Record<string, unknown>
    const items = Array.isArray(payloadRecord.items)
      ? (payloadRecord.items as ProductApiItem[])
      : Array.isArray(payloadRecord.data)
        ? (payloadRecord.data as ProductApiItem[])
        : []

    const totalItems = Number(payloadRecord.totalItems ?? items.length ?? 0)

    return {
      items: items.map((item) => mapProductItem(item as ProductApiItem)),
      totalItems: Number.isFinite(totalItems) ? totalItems : items.length,
    }
  }

  return { items: [], totalItems: 0 }
}

const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResult, ProductQueryParams | void>({
      query: (params) => ({
        tag: 'Products',
        url: '/products',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          regionId: params?.regionId || undefined,
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
          categoryId: params?.categoryId || undefined,
          status: mapStatusParam(params?.status),
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder ?? 'desc',
        },
        mockResolver: () => mockDelay(mockProducts),
      }),
      transformResponse: (
        response: ProductListApiResponse | Product[] | undefined | null,
      ): ProductListResult => normalizeProductListResponse(response),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: 'Products' as const,
                id,
              })),
              { type: 'Products' as const, id: 'LIST' },
            ]
          : [{ type: 'Products' as const, id: 'LIST' }],
    }),

    getProductDetail: builder.query<Product | undefined, string>({
      query: (id) => ({
        tag: 'Products',
        url: `/products/${id}`,
        mockResolver: () => mockDelay(getProductById(id)),
      }),
      transformResponse: (
        response: ProductDetailApiResponse | Product | undefined,
      ) => {
        if (!response) return undefined

        const payload = 'data' in response ? response.data : response
        if (!payload || typeof payload !== 'object') return undefined

        return mapProductItem(payload as ProductApiItem)
      },
      providesTags: (_result, _error, id) => [{ type: 'Products', id }],
    }),

    /** GET /products/:id/movement-history — a product's factory-batch movement
     *  history, paginated (used by the Product Master details page). */
    getProductMovementHistory: builder.query<
      { items: ProductMovementEntry[]; totalItems: number },
      ProductMovementHistoryQueryParams
    >({
      query: ({ id, ...params }) => ({
        tag: 'Products',
        url: `/products/${id}/movement-history`,
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          search: params.search || undefined,
          sortBy: params.sortBy || undefined,
          sortOrder: params.sortOrder ?? 'desc',
        },
        mockResolver: () => mockDelay({ items: [], totalItems: 0 }),
      }),
      transformResponse: (response: ProductMovementHistoryApiResponse) => ({
        items: response.data.items.map(mapProductMovementItem),
        totalItems: response.data.totalItems,
      }),
      providesTags: (_result, _error, { id }) => [
        { type: 'Products', id: `MOVEMENT_${id}` },
      ],
    }),

    getProductKpis: builder.query<
      typeof productKpis,
      ProductQueryParams | void
    >({
      query: (params) => ({
        tag: 'Products',
        url: '/analytics-cards/products',
        params: {
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
          regionId: params?.regionId || undefined,
          categoryId: params?.categoryId || undefined,
          status: mapStatusParam(params?.status),
        },
        mockResolver: () => mockDelay(productKpis),
      }),
      transformResponse: (
        response:
          { success: boolean; data: typeof productKpis } | typeof productKpis,
      ) => ('data' in response ? response.data : response),
      providesTags: [{ type: 'Products', id: 'KPIS' }],
    }),

    getProductCategoryOptions: builder.query<
      typeof productCategoryOptions,
      void
    >({
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
      invalidatesTags: [
        { type: 'Products', id: 'LIST' },
        { type: 'Products', id: 'KPIS' },
      ],
    }),

    updateProduct: builder.mutation<
      void,
      { id: string; values: ProductFormValues }
    >({
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
          mockDelay(
            parsed.rows.map((row, i) =>
              productFromImportedRow(row, mockProducts.length + i + 1),
            ),
          ),
      }),
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductDetailQuery,
  useGetProductMovementHistoryQuery,
  useGetProductKpisQuery,
  useGetProductCategoryOptionsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useImportProductsMutation,
} = productsApi
