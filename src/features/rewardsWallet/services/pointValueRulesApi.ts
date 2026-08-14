import { baseApi } from '@/store/api/baseApi'
import { mockDelay } from '@/services/mockDelay'

// ---------------------------------------------------------------------------
// GET /region-multipliers/products — Point Value Rules list
// ---------------------------------------------------------------------------

interface ProductPointRuleApiItem {
  productId: string
  productName: string
  productCode: string
  category: { id: string; code: string; name: string } | null
  dealerContainerPoints: number
  dealerProductPoints: number
  chemistContainerPoints: number
  chemistProductPoints: number
}

export interface ProductPointRuleRow {
  productId: string
  productName: string
  productCode: string
  categoryId: string | null
  categoryName: string | null
  dealerContainerPoints: number
  dealerProductPoints: number
  chemistContainerPoints: number
  chemistProductPoints: number
}

function mapProductPointRule(item: ProductPointRuleApiItem): ProductPointRuleRow {
  return {
    productId: item.productId,
    productName: item.productName || item.productCode,
    productCode: item.productCode,
    categoryId: item.category?.id ?? null,
    categoryName: item.category?.name ?? null,
    dealerContainerPoints: item.dealerContainerPoints,
    dealerProductPoints: item.dealerProductPoints,
    chemistContainerPoints: item.chemistContainerPoints,
    chemistProductPoints: item.chemistProductPoints,
  }
}

// ---------------------------------------------------------------------------
// GET /analytics-cards/point-value-rules — stat cards
// ---------------------------------------------------------------------------

export interface PointValueRulesKpis {
  totalOutstandingPointLiability: number
  configuredProductRules: number
  averageBasePointValue: number
  productCategories: number
}

// ---------------------------------------------------------------------------
// GET /products/:id/region-multipliers — product region-multiplier detail
// ---------------------------------------------------------------------------

interface ProductRegionMultiplierApiItem {
  regionId: string
  regionCode: string
  regionName: string
  dealerMultiplier: number
  chemistMultiplier: number
  dealerPoints: number
  chemistPoints: number
  isDealerOverride: boolean
  isChemistOverride: boolean
}

interface ProductRegionMultipliersApiResponse {
  success: boolean
  message?: string
  data: {
    product: {
      id: string
      productCode: string
      productName: string
      category: { id: string; code: string; name: string } | null
      dealerProductPoints: number
      chemistProductPoints: number
      status: string
      updatedBy: string
      updatedAt: string
      createdAt: string
    }
    productId: string
    dealerProductPoints: number
    chemistProductPoints: number
    regions: ProductRegionMultiplierApiItem[]
  }
}

export interface ProductRegionMultiplierRow {
  regionId: string
  regionCode: string
  regionName: string
  dealerMultiplier: number
  chemistMultiplier: number
  dealerPoints: number
  chemistPoints: number
  isDealerOverride: boolean
  isChemistOverride: boolean
}

export interface ProductRegionMultipliersDetail {
  productId: string
  productCode: string
  productName: string
  categoryName: string | null
  dealerProductPoints: number
  chemistProductPoints: number
  status: string
  updatedBy: string
  updatedAt: string
  createdAt: string
  regions: ProductRegionMultiplierRow[]
}

function mapProductRegionMultipliers(
  response: ProductRegionMultipliersApiResponse,
): ProductRegionMultipliersDetail {
  const { product, regions, dealerProductPoints, chemistProductPoints } = response.data
  return {
    productId: product.id,
    productCode: product.productCode,
    productName: product.productName || product.productCode,
    categoryName: product.category?.name ?? null,
    dealerProductPoints,
    chemistProductPoints,
    status: product.status,
    updatedBy: product.updatedBy,
    updatedAt: product.updatedAt,
    createdAt: product.createdAt,
    regions: regions.map((region) => ({ ...region })),
  }
}

// ---------------------------------------------------------------------------
// GET /products/:id/region-multiplier-history
// ---------------------------------------------------------------------------

interface ProductRegionMultiplierHistoryApiItem {
  regionId: string
  regionCode: string
  regionName: string
  previousMultiplier: number
  currentMultiplier: number
  previousPoints: number
  currentPoints: number
  changedBy: { id: string; type: string; name: string; email: string } | null
  changedAt: string | null
}

interface ProductRegionMultiplierHistoryApiResponse {
  success: boolean
  message?: string
  data: {
    items: ProductRegionMultiplierHistoryApiItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

export interface ProductRegionMultiplierHistoryRow {
  id: string
  regionId: string
  regionCode: string
  regionName: string
  previousMultiplier: number
  currentMultiplier: number
  previousPoints: number
  currentPoints: number
  changedByName: string | null
  changedAt: string | null
}

function mapRegionMultiplierHistory(
  item: ProductRegionMultiplierHistoryApiItem,
  index: number,
): ProductRegionMultiplierHistoryRow {
  return {
    id: `${item.regionId}-${item.changedAt ?? index}`,
    regionId: item.regionId,
    regionCode: item.regionCode,
    regionName: item.regionName,
    previousMultiplier: item.previousMultiplier,
    currentMultiplier: item.currentMultiplier,
    previousPoints: item.previousPoints,
    currentPoints: item.currentPoints,
    changedByName: item.changedBy?.name ?? null,
    changedAt: item.changedAt,
  }
}

export interface ProductRegionMultiplierHistoryQueryParams {
  id: string
  page?: number
  limit?: number
}

export interface ProductPointRulesQueryParams {
  regionId?: string
  preset?: string
  startDate?: string
  endDate?: string
}

// ---------------------------------------------------------------------------
// GET /region-multipliers — current global multipliers per region
// ---------------------------------------------------------------------------

interface GlobalRegionMultiplierApiItem {
  regionId: string
  regionCode: string
  regionName: string
  dealerMultiplier: number
  dealerLastMultiplier: number
  chemistMultiplier: number
  chemistLastMultiplier: number
}

export interface GlobalRegionMultiplierRow {
  regionId: string
  regionCode: string
  regionName: string
  dealerMultiplier: number
  dealerLastMultiplier: number
  chemistMultiplier: number
  chemistLastMultiplier: number
}

function mapGlobalRegionMultiplier(
  item: GlobalRegionMultiplierApiItem,
): GlobalRegionMultiplierRow {
  return { ...item }
}

const pointValueRulesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /region-multipliers/products — every product's base container/product
     *  points for Dealer and Chemist, driving the Point Value Rules list. */
    getProductPointRules: builder.query<
      ProductPointRuleRow[],
      ProductPointRulesQueryParams | void
    >({
      query: (params) => ({
        tag: 'PointValueRules',
        url: '/region-multipliers/products',
        params: {
          regionId: params?.regionId || undefined,
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () => mockDelay([]),
      }),
      transformResponse: (response: { success: boolean; data: ProductPointRuleApiItem[] }) =>
        response.data.map(mapProductPointRule),
      providesTags: (result) =>
        result
          ? [
              ...result.map((row) => ({ type: 'PointValueRules' as const, id: row.productId })),
              { type: 'PointValueRules' as const, id: 'LIST' },
            ]
          : [{ type: 'PointValueRules' as const, id: 'LIST' }],
    }),

    /** GET /analytics-cards/point-value-rules — stat card totals. */
    getPointValueRulesKpis: builder.query<
      PointValueRulesKpis,
      ProductPointRulesQueryParams | void
    >({
      query: (params) => ({
        tag: 'PointValueRules',
        url: '/analytics-cards/point-value-rules',
        params: {
          regionId: params?.regionId || undefined,
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () =>
          mockDelay({
            totalOutstandingPointLiability: 0,
            configuredProductRules: 0,
            averageBasePointValue: 0,
            productCategories: 0,
          }),
      }),
      transformResponse: (response: { success: boolean; data: PointValueRulesKpis }) =>
        response.data,
      providesTags: [{ type: 'PointValueRules', id: 'KPIS' }],
    }),

    /** GET /products/:id/region-multipliers — one product's per-region
     *  dealer/chemist multipliers and resulting points, plus override flags. */
    getProductRegionMultipliers: builder.query<ProductRegionMultipliersDetail, string>({
      query: (id) => ({
        tag: 'PointValueRules',
        url: `/products/${id}/region-multipliers`,
        mockResolver: () => Promise.reject(new Error('Region multipliers has no mock mode — real API only.')),
      }),
      transformResponse: mapProductRegionMultipliers,
      providesTags: (_result, _error, id) => [{ type: 'PointValueRules', id }],
    }),

    /** GET /products/:id/region-multiplier-history — audit trail of multiplier
     *  changes for one product. */
    getProductRegionMultiplierHistory: builder.query<
      { items: ProductRegionMultiplierHistoryRow[]; totalItems: number },
      ProductRegionMultiplierHistoryQueryParams
    >({
      query: ({ id, page, limit }) => ({
        tag: 'PointValueRules',
        url: `/products/${id}/region-multiplier-history`,
        params: { page: page ?? 1, limit: limit ?? 10 },
        mockResolver: () => mockDelay({ items: [], totalItems: 0 }),
      }),
      transformResponse: (response: ProductRegionMultiplierHistoryApiResponse) => ({
        items: response.data.items.map(mapRegionMultiplierHistory),
        totalItems: response.data.totalItems,
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'PointValueRules', id: `HISTORY_${id}` }],
    }),

    /** PATCH /products/:id/base-points — updates a product's base Dealer/Chemist
     *  product points (from which region-multiplied points are derived). */
    updateProductBasePoints: builder.mutation<
      void,
      { id: string; dealerProductPoints: number; chemistProductPoints: number }
    >({
      query: ({ id, dealerProductPoints, chemistProductPoints }) => ({
        tag: 'PointValueRules',
        url: `/products/${id}/base-points`,
        method: 'PATCH',
        data: { dealerProductPoints, chemistProductPoints },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PointValueRules', id },
        { type: 'PointValueRules', id: 'LIST' },
        { type: 'PointValueRules', id: 'KPIS' },
        { type: 'PointValueRules', id: `HISTORY_${id}` },
      ],
    }),

    /** PATCH /products/:id/region-multipliers/:regionId — overrides one
     *  product's Dealer/Chemist multiplier for a single region. */
    updateProductRegionMultiplier: builder.mutation<
      void,
      { id: string; regionId: string; dealerMultiplier: number; chemistMultiplier: number }
    >({
      query: ({ id, regionId, dealerMultiplier, chemistMultiplier }) => ({
        tag: 'PointValueRules',
        url: `/products/${id}/region-multipliers/${regionId}`,
        method: 'PATCH',
        data: { dealerMultiplier, chemistMultiplier },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PointValueRules', id },
        { type: 'PointValueRules', id: 'LIST' },
        { type: 'PointValueRules', id: 'KPIS' },
        { type: 'PointValueRules', id: `HISTORY_${id}` },
      ],
    }),

    /** DELETE /products/:id/region-multipliers/:regionId — clears a product's
     *  region-specific override, reverting it back to the current global
     *  multiplier for that region. */
    resetProductRegionMultiplier: builder.mutation<void, { id: string; regionId: string }>({
      query: ({ id, regionId }) => ({
        tag: 'PointValueRules',
        url: `/products/${id}/region-multipliers/${regionId}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PointValueRules', id },
        { type: 'PointValueRules', id: 'LIST' },
        { type: 'PointValueRules', id: 'KPIS' },
        { type: 'PointValueRules', id: `HISTORY_${id}` },
      ],
    }),

    /** GET /region-multipliers — the current global multiplier per region,
     *  for both Dealer and Chemist, plus each one's previous value. */
    getGlobalRegionMultipliers: builder.query<GlobalRegionMultiplierRow[], void>({
      query: () => ({
        tag: 'PointValueRules',
        url: '/region-multipliers',
        mockResolver: () => mockDelay([]),
      }),
      transformResponse: (response: { success: boolean; data: GlobalRegionMultiplierApiItem[] }) =>
        response.data.map(mapGlobalRegionMultiplier),
      providesTags: [{ type: 'PointValueRules', id: 'GLOBAL_MULTIPLIERS' }],
    }),

    /** PATCH /region-multipliers/bulk — sets a Dealer OR Chemist multiplier for
     *  a set of regions across every product globally in one call. Per partner
     *  type, exactly one region must end up at multiplier 1 — any region left
     *  out of the request is forced back to 1 server-side. Admin/Super Admin only. */
    bulkUpdateRegionMultipliers: builder.mutation<
      void,
      {
        regions: Array<{
          regionId: string
          dealerMultiplier: number
          chemistMultiplier: number
        }>
      }
    >({
      query: ({ regions }) => ({
        tag: 'PointValueRules',
        url: '/region-multipliers/bulk',
        method: 'PATCH',
        data: { regions },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [
        { type: 'PointValueRules', id: 'LIST' },
        { type: 'PointValueRules', id: 'KPIS' },
        { type: 'PointValueRules', id: 'GLOBAL_MULTIPLIERS' },
      ],
    }),
  }),
})

export const {
  useGetProductPointRulesQuery,
  useGetPointValueRulesKpisQuery,
  useGetProductRegionMultipliersQuery,
  useGetProductRegionMultiplierHistoryQuery,
  useUpdateProductBasePointsMutation,
  useUpdateProductRegionMultiplierMutation,
  useResetProductRegionMultiplierMutation,
  useGetGlobalRegionMultipliersQuery,
  useBulkUpdateRegionMultipliersMutation,
} = pointValueRulesApi
