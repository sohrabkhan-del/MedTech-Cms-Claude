import { baseApi } from '@/store/api/baseApi'
import { mockDelay } from '@/services/mockDelay'
import type { WalletUserType } from '@/features/rewardsWallet/types/rewardsWallet.types'

export type WalletPartnerType = 'CHEMIST' | 'DEALER'

export interface WalletPartnersQueryParams {
  page?: number
  limit?: number
  search?: string
  type?: WalletPartnerType
  regionId?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  preset?: string
  startDate?: string
  endDate?: string
}

interface PartnerRegionApiItem {
  id: string
  code?: string | null
  name?: string | null
  isActive?: boolean
}

interface PartnerApiItem {
  id: string
  referenceId?: string | null
  type: WalletPartnerType
  businessName?: string | null
  ownerName?: string | null
  email?: string | null
  phone?: string | null
  regionId?: string | null
  region?: PartnerRegionApiItem | null
  status?: string | null
  isBlocked?: boolean
  updatedAt?: string | null
  business?: Array<{ outletName?: string | null }>
}

interface PartnerListApiResponse {
  success: boolean
  data: {
    items: PartnerApiItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

export interface WalletPartnerRow {
  id: string
  referenceId: string
  userType: WalletUserType
  businessName: string
  mobileNumber: string
  email: string
  regionId: string
  regionName: string
  status: string
  isBlocked: boolean
  lastUpdated: string
}

function mapUserType(type: WalletPartnerType): WalletUserType {
  return type === 'CHEMIST' ? 'Chemist' : 'Dealer'
}

function mapWalletPartner(item: PartnerApiItem): WalletPartnerRow {
  const business = item.business?.[0]
  return {
    id: item.id,
    referenceId: item.referenceId ?? '-',
    userType: mapUserType(item.type),
    businessName: business?.outletName || item.businessName || item.ownerName || '-',
    mobileNumber: item.phone ?? '-',
    email: item.email ?? '-',
    regionId: item.regionId ?? item.region?.id ?? '',
    regionName: item.region?.name ?? '-',
    status: item.status ?? 'INACTIVE',
    isBlocked: item.isBlocked ?? false,
    lastUpdated: item.updatedAt ?? '-',
  }
}

export interface PartnerWalletBalance {
  totalPoints: number
  totalPointsEarned: number
  totalPointsRedeemed: number
  role: string
  general: number
}

interface PartnerWalletBalanceApiResponse {
  success: boolean
  data: {
    total_points: number
    total_points_earned: number
    total_points_redeemed: number
    role: string
    general: number
    seasonalCampaignRewards?: unknown[]
  }
}

function mapPartnerWalletBalance(
  response: PartnerWalletBalanceApiResponse,
): PartnerWalletBalance {
  const data = response.data
  return {
    totalPoints: data.total_points,
    totalPointsEarned: data.total_points_earned,
    totalPointsRedeemed: data.total_points_redeemed,
    role: data.role,
    general: data.general,
  }
}

const walletPartnersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /partners — same partner directory used by the Dealer/Chemist
     *  lists, filtered here for the Wallet Management table (identity/region
     *  fields only; balances come from getPartnerWalletBalance per row). */
    getWalletPartners: builder.query<
      { items: WalletPartnerRow[]; totalItems: number },
      WalletPartnersQueryParams | void
    >({
      query: (params) => ({
        tag: 'Partners',
        url: '/partners',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          type: params?.type || undefined,
          regionId: params?.regionId || undefined,
          status: params?.status || undefined,
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder ?? 'desc',
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () => mockDelay({ items: [], totalItems: 0 }),
      }),
      transformResponse: (response: PartnerListApiResponse) => ({
        items: response.data.items.map(mapWalletPartner),
        totalItems: response.data.totalItems,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Partners' as const, id })),
              { type: 'Partners' as const, id: 'LIST' },
            ]
          : [{ type: 'Partners' as const, id: 'LIST' }],
    }),

    /** GET /admin/wallet/{partnerId} — a single partner's point balance, fetched
     *  per row on the Wallet Management table (no bulk-balance endpoint exists). */
    getPartnerWalletBalance: builder.query<PartnerWalletBalance, string>({
      query: (partnerId) => ({
        tag: 'Wallets',
        url: `/admin/wallet/${partnerId}`,
        mockResolver: () =>
          mockDelay({
            success: true,
            data: {
              total_points: 0,
              total_points_earned: 0,
              total_points_redeemed: 0,
              role: '',
              general: 0,
              seasonalCampaignRewards: [],
            },
          }),
      }),
      transformResponse: mapPartnerWalletBalance,
      providesTags: (_result, _error, partnerId) => [{ type: 'Wallets', id: partnerId }],
    }),

    /** POST /admin/wallet/{partnerId}/credit — adjusts a partner's point
     *  balance. Positive `points` credits (Add Points); negative `points`
     *  debits (Remove Points) — there is no separate debit endpoint. */
    creditPartnerWallet: builder.mutation<
      void,
      { partnerId: string; points: number; note: string }
    >({
      query: ({ partnerId, points, note }) => ({
        tag: 'Wallets',
        url: `/admin/wallet/${partnerId}/credit`,
        method: 'POST',
        data: { points, note },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { partnerId }) => [
        { type: 'Wallets', id: partnerId },
        { type: 'Wallets', id: `PARTNER_${partnerId}` },
      ],
    }),
  }),
})

export const {
  useGetWalletPartnersQuery,
  useGetPartnerWalletBalanceQuery,
  useCreditPartnerWalletMutation,
} = walletPartnersApi
