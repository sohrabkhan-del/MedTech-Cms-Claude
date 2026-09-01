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
  createdAt?: string | null
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
    businessName:
      business?.outletName || item.businessName || item.ownerName || '-',
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
  seasonalPoints: number
}

interface PartnerWalletBalanceApiResponse {
  success: boolean
  data: {
    total_points?: number
    total_points_earned?: number
    total_points_redeemed?: number
    role?: string
    general?: number
    generalPoints?: number
    seasonalPoints?: number
    seasonal_points?: number
    seasonalCampaignRewards?: unknown[]
  }
}

function mapPartnerWalletBalance(
  response: PartnerWalletBalanceApiResponse,
): PartnerWalletBalance {
  const data = response.data
  return {
    totalPoints: data.total_points ?? 0,
    totalPointsEarned: data.total_points_earned ?? 0,
    totalPointsRedeemed: data.total_points_redeemed ?? 0,
    role: data.role ?? '',
    general: data.general ?? data.generalPoints ?? 0,
    seasonalPoints: data.seasonalPoints ?? data.seasonal_points ?? 0,
  }
}

export interface PartnerWalletDetails {
  partnerId: string
  referenceId: string
  userType: WalletUserType
  businessName: string
  ownerName: string
  email: string
  mobileNumber: string
  regionName: string
  status: string
  createdAt: string
  updatedAt: string
  walletId: string
  currentWalletBalance: number
  lifetimePointsEarned: number
  lifetimePointsRedeemed: number
  pendingRedemptionPoints: number
}

interface PartnerWalletDetailsApiResponse {
  success: boolean
  data: {
    partner: PartnerApiItem
    wallet: {
      id: string
      currentWalletBalance: number
      lifetimePointsEarned: number
      lifetimePointsRedeemed: number
      pendingRedemptionPoints: number
    }
  }
}

function mapPartnerWalletDetails(
  response: PartnerWalletDetailsApiResponse,
): PartnerWalletDetails {
  const { partner, wallet } = response.data
  const business = partner.business?.[0]
  return {
    partnerId: partner.id,
    referenceId: partner.referenceId ?? '-',
    userType: mapUserType(partner.type),
    businessName:
      business?.outletName || partner.businessName || partner.ownerName || '-',
    ownerName: partner.ownerName ?? '-',
    email: partner.email ?? '-',
    mobileNumber: partner.phone ?? '-',
    regionName: partner.region?.name ?? '-',
    status: partner.status ?? 'INACTIVE',
    createdAt: partner.createdAt ?? '-',
    updatedAt: partner.updatedAt ?? '-',
    walletId: wallet.id,
    currentWalletBalance: wallet.currentWalletBalance,
    lifetimePointsEarned: wallet.lifetimePointsEarned,
    lifetimePointsRedeemed: wallet.lifetimePointsRedeemed,
    pendingRedemptionPoints: wallet.pendingRedemptionPoints,
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
              ...result.items.map(({ id }) => ({
                type: 'Partners' as const,
                id,
              })),
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
      providesTags: (_result, _error, partnerId) => [
        { type: 'Wallets', id: partnerId },
      ],
    }),

    /** GET /admin/wallet/{partnerId}/details — full Wallet Details page data:
     *  partner identity fields plus the wallet's balance/lifetime totals. */
    getPartnerWalletDetails: builder.query<PartnerWalletDetails, string>({
      query: (partnerId) => ({
        tag: 'Wallets',
        url: `/admin/wallet/${partnerId}/details`,
        mockResolver: () =>
          Promise.reject(
            new Error('Wallet details has no mock mode — real API only.'),
          ),
      }),
      transformResponse: mapPartnerWalletDetails,
      providesTags: (_result, _error, partnerId) => [
        { type: 'Wallets', id: partnerId },
        { type: 'Wallets', id: `DETAILS_${partnerId}` },
      ],
    }),

    /** POST /admin/wallet/{partnerId}/credit — adjusts a partner's point
     *  balance. `points` is always a positive integer; `type` says whether
     *  it's a credit (Add Points) or debit (Remove Points). */
    creditPartnerWallet: builder.mutation<
      void,
      {
        partnerId: string
        points: number
        note: string
        type: 'credit' | 'debit'
      }
    >({
      query: ({ partnerId, points, note, type }) => ({
        tag: 'Wallets',
        url: `/admin/wallet/${partnerId}/credit`,
        method: 'POST',
        data: { points, note, type },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { partnerId }) => [
        { type: 'Wallets', id: partnerId },
        { type: 'Wallets', id: `PARTNER_${partnerId}` },
        { type: 'Wallets', id: `DETAILS_${partnerId}` },
      ],
    }),
  }),
})

export const {
  useGetWalletPartnersQuery,
  useGetPartnerWalletBalanceQuery,
  useGetPartnerWalletDetailsQuery,
  useCreditPartnerWalletMutation,
} = walletPartnersApi
