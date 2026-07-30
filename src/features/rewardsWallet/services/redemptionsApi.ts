// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockRedemptionRequests,
  getRedemptionRequestById,
  getRedemptionRequestsByUserId,
  redemptionKpis,
} from '@/features/rewardsWallet/mockRedemptions'
import { giftCategoryOptions } from '@/features/schemeManagement/mockGifts'
import { getSchemeById } from '@/features/schemeManagement/mockSchemes'
import type {
  RedemptionRequest,
  RedemptionStatus,
  RedemptionDeliveryStatus,
} from '@/features/rewardsWallet/types/rewardsWallet.types'
import type { SchemeApplicableProduct } from '@/types/scheme'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// redemptions API is available. setStatus/setDeliveryStatus are currently
// no-ops resolving immediately so the UI/hook contract is stable ahead of time.

export interface RedemptionFormOptions {
  rewardCategoryOptions: string[]
}

const redemptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRedemptions: builder.query<RedemptionRequest[], void>({
      query: () => ({
        tag: 'Redemptions',
        url: '/redemptions',
        mockResolver: () => mockDelay(mockRedemptionRequests),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Redemptions' as const, id })),
              { type: 'Redemptions' as const, id: 'LIST' },
            ]
          : [{ type: 'Redemptions' as const, id: 'LIST' }],
    }),

    getRedemptionDetail: builder.query<RedemptionRequest | undefined, string>({
      query: (id) => ({
        tag: 'Redemptions',
        url: `/redemptions/${id}`,
        mockResolver: () => mockDelay(getRedemptionRequestById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'Redemptions', id }],
    }),

    getRedemptionsByUserId: builder.query<RedemptionRequest[], string>({
      query: (userId) => ({
        tag: 'Redemptions',
        url: '/redemptions',
        params: { userId },
        mockResolver: () => mockDelay(getRedemptionRequestsByUserId(userId)),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Redemptions' as const, id })),
              { type: 'Redemptions' as const, id: 'USER_LIST' },
            ]
          : [{ type: 'Redemptions' as const, id: 'USER_LIST' }],
    }),

    getRedemptionKpis: builder.query<typeof redemptionKpis, void>({
      query: () => ({
        tag: 'Redemptions',
        url: '/redemptions/kpis',
        mockResolver: () => mockDelay(redemptionKpis),
      }),
      providesTags: [{ type: 'Redemptions', id: 'KPIS' }],
    }),

    getRedemptionFormOptions: builder.query<RedemptionFormOptions, void>({
      query: () => ({
        tag: 'Redemptions',
        url: '/redemptions/form-options',
        mockResolver: () => mockDelay({ rewardCategoryOptions: giftCategoryOptions }),
      }),
      providesTags: [{ type: 'Redemptions', id: 'FORM_OPTIONS' }],
    }),

    setRedemptionStatus: builder.mutation<void, { id: string; status: RedemptionStatus }>({
      query: ({ id, status }) => ({
        tag: 'Redemptions',
        url: `/redemptions/${id}/status`,
        method: 'PATCH',
        data: { status },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Redemptions', id },
        { type: 'Redemptions', id: 'LIST' },
        { type: 'Redemptions', id: 'USER_LIST' },
        { type: 'Redemptions', id: 'KPIS' },
      ],
    }),

    setDeliveryStatus: builder.mutation<void, { id: string; status: RedemptionDeliveryStatus }>({
      query: ({ id, status }) => ({
        tag: 'Redemptions',
        url: `/redemptions/${id}/delivery-status`,
        method: 'PATCH',
        data: { status },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Redemptions', id },
        { type: 'Redemptions', id: 'LIST' },
        { type: 'Redemptions', id: 'USER_LIST' },
        { type: 'Redemptions', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetRedemptionsQuery,
  useGetRedemptionDetailQuery,
  useGetRedemptionsByUserIdQuery,
  useGetRedemptionKpisQuery,
  useGetRedemptionFormOptionsQuery,
  useSetRedemptionStatusMutation,
  useSetDeliveryStatusMutation,
} = redemptionsApi

/**
 * TODO: wire into the real Points ledger once it exists.
 *
 * Rule: a Seasonal scheme is a walled-off Points bucket. Points a partner earns
 * after enrolling in a seasonal scheme can only be redeemed against gift products
 * attached to THAT SAME seasonal scheme — they never fall back to (or combine with)
 * the partner's general Points pool. A General scheme has no such restriction: its
 * Points behave like the partner's normal, unrestricted balance.
 *
 * When the ledger is implemented, every redemption must resolve which bucket it is
 * drawing from — `schemeId: null` (general pool) or a specific seasonal `schemeId` —
 * and this function is where that source-scheme check belongs:
 *   1. If `sourceSchemeId` is a seasonal scheme, the target product must be one of
 *      that scheme's attached products (`Scheme.products[].productId`), and the
 *      Points spent must come only from that scheme's earned balance.
 *   2. If `sourceSchemeId` is null/general (or a general scheme), normal unrestricted
 *      redemption applies.
 *
 * Non-async helper retained as-is; not a network call, no RTK Query wrapper needed.
 */
export function canRedeemFromScheme(
  sourceSchemeId: string | null,
  productId: string,
): boolean {
  if (!sourceSchemeId) return true
  const scheme = getSchemeById(sourceSchemeId)
  if (!scheme) return true
  if (scheme.type !== 'seasonal') return true
  return scheme.applicableProducts.some(
    (p: SchemeApplicableProduct) => p.productId === productId,
  )
}
