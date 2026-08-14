import { baseApi } from '@/store/api/baseApi'
import { mockDelay } from '@/services/mockDelay'

export interface PartnerActivityQueryParams {
  partnerId: string
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
}

interface PagedApiResponse<T> {
  success: boolean
  data: {
    items: T[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

interface PagedResult<T> {
  items: T[]
  totalItems: number
}

function pagedQuery(url: string) {
  return (params: Omit<PartnerActivityQueryParams, 'partnerId'>) => ({
    url,
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search || undefined,
      sortBy: params.sortBy || undefined,
      sortOrder: params.sortOrder ?? 'desc',
      startDate: params.startDate || undefined,
      endDate: params.endDate || undefined,
    },
  })
}

// ---------------------------------------------------------------------------
// Scan History — GET /product-scan/partner/:partnerId
// ---------------------------------------------------------------------------

interface ScanHistoryApiItem {
  id: string
  referenceId: string
  scannedAt: string
  scanResult: string
  scanResultType: string
  scanStatus: string
  scannedCode: string
  productDetails?: { productCode?: string | null; productCategory?: string | null } | null
  region?: string | null
  rewardPointsEarned: number
}

export interface PartnerScanHistoryRow {
  id: string
  referenceId: string
  scannedAt: string
  scannedCode: string
  productCode: string
  rewardPointsEarned: number
  scanResult: string
  scanResultType: string
}

function mapScanHistory(item: ScanHistoryApiItem): PartnerScanHistoryRow {
  return {
    id: item.id,
    referenceId: item.referenceId,
    scannedAt: item.scannedAt,
    scannedCode: item.scannedCode,
    productCode: item.productDetails?.productCode ?? '-',
    rewardPointsEarned: item.rewardPointsEarned,
    scanResult: item.scanResult,
    scanResultType: item.scanResultType,
  }
}

// ---------------------------------------------------------------------------
// Interested Products — GET /showcase-products/interests/partner/:partnerId
// ---------------------------------------------------------------------------

interface InterestedProductApiItem {
  id: string
  productSnapshot?: { name?: string | null } | null
  quantityRequested: number
  note?: string | null
  status: string
  followedUpByDetails?: { name?: string | null } | null
  createdAt: string
}

export interface PartnerInterestedProductRow {
  id: string
  productName: string
  quantityRequested: number
  status: string
  handledBy: string
  requestedDate: string
}

function mapInterestedProduct(item: InterestedProductApiItem): PartnerInterestedProductRow {
  return {
    id: item.id,
    productName: item.productSnapshot?.name ?? '-',
    quantityRequested: item.quantityRequested,
    status: item.status,
    handledBy: item.followedUpByDetails?.name ?? '-',
    requestedDate: item.createdAt,
  }
}

// ---------------------------------------------------------------------------
// Redemption History — GET /admin/reward-claims/partner/:partnerId
// ---------------------------------------------------------------------------

interface RewardClaimApiItem {
  id: string
  referenceId: string
  rewardSnapshot?: { name?: string | null } | null
  pointsRequired: number
  status: string
  createdAt: string
  reviewedAt?: string | null
}

export interface PartnerRedemptionRow {
  id: string
  referenceId: string
  rewardItem: string
  pointsUsed: number
  status: string
  requestDate: string
}

function mapRewardClaim(item: RewardClaimApiItem): PartnerRedemptionRow {
  return {
    id: item.id,
    referenceId: item.referenceId,
    rewardItem: item.rewardSnapshot?.name ?? '-',
    pointsUsed: item.pointsRequired,
    status: item.status,
    requestDate: item.createdAt,
  }
}

// ---------------------------------------------------------------------------
// Points History — GET /admin/wallet/:partnerId/transactions
// ---------------------------------------------------------------------------

interface WalletTransactionApiItem {
  id: string
  type: 'credit' | 'debit'
  points: number
  reason?: string | null
  balanceBefore: number
  balanceAfter: number
  createdAt: string
}

export interface PartnerPointsHistoryRow {
  id: string
  type: 'credit' | 'debit'
  points: number
  reason: string
  balanceBefore: number
  balanceAfter: number
  createdAt: string
}

function mapWalletTransaction(item: WalletTransactionApiItem): PartnerPointsHistoryRow {
  return {
    id: item.id,
    type: item.type,
    points: item.points,
    reason: item.reason ?? '-',
    balanceBefore: item.balanceBefore,
    balanceAfter: item.balanceAfter,
    createdAt: item.createdAt,
  }
}

const partnerActivityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /product-scan/partner/:partnerId — a partner's product scan history. */
    getPartnerScanHistory: builder.query<
      PagedResult<PartnerScanHistoryRow>,
      PartnerActivityQueryParams
    >({
      query: ({ partnerId, ...params }) => ({
        tag: 'ScanFeed',
        ...pagedQuery(`/product-scan/partner/${partnerId}`)(params),
        mockResolver: () => mockDelay({ items: [], totalItems: 0 }),
      }),
      transformResponse: (response: PagedApiResponse<ScanHistoryApiItem>) => ({
        items: response.data.items.map(mapScanHistory),
        totalItems: response.data.totalItems,
      }),
      providesTags: (_result, _error, { partnerId }) => [
        { type: 'ScanFeed', id: `PARTNER_${partnerId}` },
      ],
    }),

    /** GET /showcase-products/interests/partner/:partnerId — a partner's showcase
     *  product interest requests. */
    getPartnerInterestedProducts: builder.query<
      PagedResult<PartnerInterestedProductRow>,
      PartnerActivityQueryParams
    >({
      query: ({ partnerId, ...params }) => ({
        tag: 'ShowcaseProducts',
        ...pagedQuery(`/showcase-products/interests/partner/${partnerId}`)(params),
        mockResolver: () => mockDelay({ items: [], totalItems: 0 }),
      }),
      transformResponse: (response: PagedApiResponse<InterestedProductApiItem>) => ({
        items: response.data.items.map(mapInterestedProduct),
        totalItems: response.data.totalItems,
      }),
      providesTags: (_result, _error, { partnerId }) => [
        { type: 'ShowcaseProducts', id: `PARTNER_${partnerId}` },
      ],
    }),

    /** GET /admin/reward-claims/partner/:partnerId — a partner's reward redemption
     *  claims (Redemption History). */
    getPartnerRedemptions: builder.query<
      PagedResult<PartnerRedemptionRow>,
      PartnerActivityQueryParams
    >({
      query: ({ partnerId, ...params }) => ({
        tag: 'Redemptions',
        ...pagedQuery(`/admin/reward-claims/partner/${partnerId}`)(params),
        mockResolver: () => mockDelay({ items: [], totalItems: 0 }),
      }),
      transformResponse: (response: PagedApiResponse<RewardClaimApiItem>) => ({
        items: response.data.items.map(mapRewardClaim),
        totalItems: response.data.totalItems,
      }),
      providesTags: (_result, _error, { partnerId }) => [
        { type: 'Redemptions', id: `PARTNER_${partnerId}` },
      ],
    }),

    /** GET /admin/wallet/:partnerId/transactions — a partner's wallet ledger
     *  (Points History). */
    getPartnerPointsHistory: builder.query<
      PagedResult<PartnerPointsHistoryRow>,
      PartnerActivityQueryParams
    >({
      query: ({ partnerId, ...params }) => ({
        tag: 'Wallets',
        ...pagedQuery(`/admin/wallet/${partnerId}/transactions`)(params),
        mockResolver: () => mockDelay({ items: [], totalItems: 0 }),
      }),
      transformResponse: (response: PagedApiResponse<WalletTransactionApiItem>) => ({
        items: response.data.items.map(mapWalletTransaction),
        totalItems: response.data.totalItems,
      }),
      providesTags: (_result, _error, { partnerId }) => [
        { type: 'Wallets', id: `PARTNER_${partnerId}` },
      ],
    }),
  }),
})

export const {
  useGetPartnerScanHistoryQuery,
  useGetPartnerInterestedProductsQuery,
  useGetPartnerRedemptionsQuery,
  useGetPartnerPointsHistoryQuery,
} = partnerActivityApi
