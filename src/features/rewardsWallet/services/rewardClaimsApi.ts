import { baseApi } from '@/store/api/baseApi'
import { mockDelay } from '@/services/mockDelay'

// ---------------------------------------------------------------------------
// GET /admin/reward-claims — Reward Redemptions list
// GET /admin/reward-claims/:id — Reward Redemption details
// ---------------------------------------------------------------------------

export type RewardClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface RewardClaimApiRewardSnapshot {
  name?: string | null
  categoryId?: string | null
  brand?: string | null
  pointsRequired?: number | null
}

interface RewardClaimApiPartnerSnapshot {
  userId?: string | null
  name?: string | null
  businessName?: string | null
  role?: string | null
  mobile?: string | null
}

interface RewardClaimApiReviewer {
  id: string
  type: string
  name: string
  email: string
}

interface RewardClaimApiItem {
  id: string
  rewardProductId: string | null
  rewardSnapshot: RewardClaimApiRewardSnapshot | null
  partnerId: string | null
  partnerSnapshot: RewardClaimApiPartnerSnapshot | null
  pointsRequired: number
  note: string | null
  status: RewardClaimStatus
  reviewedAt: string | null
  reviewedBy: string | RewardClaimApiReviewer | null
  reviewNote: string | null
  walletTransactionId: string | null
  refundTransactionId: string | null
  campaignId: string | null
  groupProductId: string | null
  pointsBucket: string | null
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: string | null
  createdAt: string
  referenceId: string
  updatedAt: string
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

export interface RewardClaimRow {
  id: string
  referenceId: string
  rewardItem: string
  rewardCategoryId: string | null
  rewardBrand: string | null
  partnerId: string | null
  partnerName: string
  businessName: string | null
  partnerRole: string | null
  mobile: string | null
  pointsRequired: number
  note: string | null
  status: RewardClaimStatus
  reviewedAt: string | null
  reviewedBy: string | null
  reviewNote: string | null
  walletTransactionId: string | null
  refundTransactionId: string | null
  createdAt: string
  updatedAt: string
}

function mapRewardClaim(item: RewardClaimApiItem): RewardClaimRow {
  return {
    id: item.id,
    referenceId: item.referenceId,
    rewardItem: item.rewardSnapshot?.name ?? '-',
    rewardCategoryId: item.rewardSnapshot?.categoryId ?? null,
    rewardBrand: item.rewardSnapshot?.brand ?? null,
    partnerId: item.partnerId,
    partnerName: item.partnerSnapshot?.name ?? '-',
    businessName: item.partnerSnapshot?.businessName ?? null,
    partnerRole: item.partnerSnapshot?.role ?? null,
    mobile: item.partnerSnapshot?.mobile ?? null,
    pointsRequired: item.pointsRequired,
    note: item.note,
    status: item.status,
    reviewedAt: item.reviewedAt,
    reviewedBy:
      typeof item.reviewedBy === 'string'
        ? item.reviewedBy
        : (item.reviewedBy?.name ?? null),
    reviewNote: item.reviewNote,
    walletTransactionId: item.walletTransactionId,
    refundTransactionId: item.refundTransactionId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export interface RewardClaimsQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: RewardClaimStatus | 'all'
  regionId?: string
  preset?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface RewardClaimsKpis {
  totalRequests: number
  totalRequestsChange: number
  pendingApprovals: number
  pendingApprovalsChange: number
  completedRedemptions: number
  completedRedemptionsChange: number
  pointsRedeemed: number
  pointsRedeemedChange: number
}

// ---------------------------------------------------------------------------
// GET /admin/reward-claims/:id — Reward Redemption details
// ---------------------------------------------------------------------------

export type RewardClaimDeliveryStatus =
  'PENDING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

interface RewardClaimDetailApiResponse {
  success: boolean
  data: {
    summary: {
      requestId: string
      businessName: string | null
      userType: string | null
      mobileNumber: string | null
      rewardItem: string | null
      rewardCategory: string | null
      pointsUsed: number
      currentWalletBalance: number | null
      requestDate: string
      redemptionStatus: string
    }
    pointsRedeemed: number
    walletBalanceAfterRedemption: number | null
    approvalStatus: string
    deliveryStatus: RewardClaimDeliveryStatus
    redemptionInformation: {
      deliveryStatus: RewardClaimDeliveryStatus
      approvedBy: {
        id: string
        type: string
        name: string
        email: string
      } | null
    }
    walletTransactionDetails: {
      transactionId?: string | null
      transactionDate?: string | null
      transactionStatus?: string | null
    } | null
    internalNotes: string | null
  }
}

export interface RewardClaimDetail {
  requestId: string
  businessName: string | null
  userType: string | null
  mobileNumber: string | null
  rewardItem: string | null
  rewardCategory: string | null
  pointsUsed: number
  currentWalletBalance: number | null
  requestDate: string
  redemptionStatus: string
  pointsRedeemed: number
  walletBalanceAfterRedemption: number | null
  approvalStatus: string
  deliveryStatus: RewardClaimDeliveryStatus
  approvedBy: { id: string; type: string; name: string; email: string } | null
  transactionId: string | null
  transactionDate: string | null
  transactionStatus: string | null
  internalNotes: string | null
}

function mapRewardClaimDetail(
  response: RewardClaimDetailApiResponse,
): RewardClaimDetail {
  const { data } = response
  return {
    requestId: data.summary.requestId,
    businessName: data.summary.businessName,
    userType: data.summary.userType,
    mobileNumber: data.summary.mobileNumber,
    rewardItem: data.summary.rewardItem,
    rewardCategory: data.summary.rewardCategory,
    pointsUsed: data.summary.pointsUsed,
    currentWalletBalance: data.summary.currentWalletBalance,
    requestDate: data.summary.requestDate,
    redemptionStatus: data.summary.redemptionStatus,
    pointsRedeemed: data.pointsRedeemed,
    walletBalanceAfterRedemption: data.walletBalanceAfterRedemption,
    approvalStatus: data.approvalStatus,
    deliveryStatus: data.deliveryStatus,
    approvedBy: data.redemptionInformation.approvedBy,
    transactionId: data.walletTransactionDetails?.transactionId ?? null,
    transactionDate: data.walletTransactionDetails?.transactionDate ?? null,
    transactionStatus: data.walletTransactionDetails?.transactionStatus ?? null,
    internalNotes: data.internalNotes,
  }
}

const rewardClaimsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /admin/reward-claims — all reward redemption requests. */
    getRewardClaims: builder.query<
      { items: RewardClaimRow[]; totalItems: number },
      RewardClaimsQueryParams | void
    >({
      query: (params) => ({
        tag: 'RewardClaims',
        url: '/admin/reward-claims',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
          search: params?.search || undefined,
          status:
            params?.status && params.status !== 'all'
              ? params.status
              : undefined,
          regionId: params?.regionId || undefined,
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder || undefined,
        },
        mockResolver: () => mockDelay({ items: [], totalItems: 0 }),
      }),
      transformResponse: (response: PagedApiResponse<RewardClaimApiItem>) => ({
        items: response.data.items.map(mapRewardClaim),
        totalItems: response.data.totalItems,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((row) => ({
                type: 'RewardClaims' as const,
                id: row.id,
              })),
              { type: 'RewardClaims' as const, id: 'LIST' },
            ]
          : [{ type: 'RewardClaims' as const, id: 'LIST' }],
    }),

    /** GET /analytics-cards/redemption — stat card totals. */
    getRewardClaimsKpis: builder.query<
      RewardClaimsKpis,
      RewardClaimsQueryParams | void
    >({
      query: (params) => ({
        tag: 'RewardClaims',
        url: '/analytics-cards/redemption',
        params: {
          regionId: params?.regionId || undefined,
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () =>
          mockDelay({
            totalRequests: 0,
            totalRequestsChange: 0,
            pendingApprovals: 0,
            pendingApprovalsChange: 0,
            completedRedemptions: 0,
            completedRedemptionsChange: 0,
            pointsRedeemed: 0,
            pointsRedeemedChange: 0,
          }),
      }),
      transformResponse: (response: {
        success: boolean
        data: {
          totalRedemptionRequests: number
          totalRedemptionRequestsChange: number
          pendingApprovals: number
          pendingApprovalsChange: number
          completedRedemptions: number
          completedRedemptionsChange: number
          pointsRedeemed: number
          pointsRedeemedChange: number
        }
      }) => ({
        totalRequests: response.data.totalRedemptionRequests,
        totalRequestsChange: response.data.totalRedemptionRequestsChange,
        pendingApprovals: response.data.pendingApprovals,
        pendingApprovalsChange: response.data.pendingApprovalsChange,
        completedRedemptions: response.data.completedRedemptions,
        completedRedemptionsChange: response.data.completedRedemptionsChange,
        pointsRedeemed: response.data.pointsRedeemed,
        pointsRedeemedChange: response.data.pointsRedeemedChange,
      }),
      providesTags: [{ type: 'RewardClaims', id: 'KPIS' }],
    }),

    /** GET /admin/reward-claims/:id — a single reward redemption request. */
    getRewardClaimDetail: builder.query<RewardClaimDetail, string>({
      query: (id) => ({
        tag: 'RewardClaims',
        url: `/admin/reward-claims/${id}`,
        mockResolver: () =>
          Promise.reject(
            new Error('Reward claim detail has no mock mode — real API only.'),
          ),
      }),
      transformResponse: mapRewardClaimDetail,
      providesTags: (_result, _error, id) => [{ type: 'RewardClaims', id }],
    }),

    /** PATCH /admin/reward-claims/:id/status — approve or reject a reward claim. */
    setRewardClaimStatus: builder.mutation<
      void,
      { id: string; status: 'APPROVED' | 'REJECTED'; reviewNote?: string }
    >({
      query: ({ id, status, reviewNote }) => ({
        tag: 'RewardClaims',
        url: `/admin/reward-claims/${id}/status`,
        method: 'PATCH',
        data: { status, reviewNote },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RewardClaims', id },
        { type: 'RewardClaims', id: 'LIST' },
        { type: 'RewardClaims', id: 'KPIS' },
      ],
    }),

    /** PATCH /admin/reward-claims/:id/delivery — updates a reward claim's delivery status. */
    setRewardClaimDeliveryStatus: builder.mutation<
      void,
      { id: string; deliveryStatus: RewardClaimDeliveryStatus }
    >({
      query: ({ id, deliveryStatus }) => ({
        tag: 'RewardClaims',
        url: `/admin/reward-claims/${id}/delivery`,
        method: 'PATCH',
        data: { deliveryStatus },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RewardClaims', id },
        { type: 'RewardClaims', id: 'LIST' },
        { type: 'RewardClaims', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetRewardClaimsQuery,
  useGetRewardClaimsKpisQuery,
  useGetRewardClaimDetailQuery,
  useSetRewardClaimStatusMutation,
  useSetRewardClaimDeliveryStatusMutation,
} = rewardClaimsApi
