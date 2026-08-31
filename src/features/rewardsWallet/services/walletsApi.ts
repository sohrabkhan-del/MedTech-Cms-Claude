// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import { mockWallets, getWalletById, walletKpis, walletGiftCategoryOptions } from '@/features/rewardsWallet/mockWallets'
import type { Wallet } from '@/features/rewardsWallet/types/rewardsWallet.types'
import { mockDelay } from '@/services/mockDelay'
import type { WalletPartnerType } from '@/features/rewardsWallet/services/walletPartnersApi'

// TODO: replace mock-backed implementations with apiClient calls once the
// wallet management API is available. adjustBalance is currently a no-op
// resolving immediately so the UI/hook contract is stable ahead of time.

export interface WalletFormOptions {
  walletGiftCategoryOptions: string[]
}

export interface WalletKpiQueryParams {
  regionId?: string
  type?: WalletPartnerType
  preset?: string
  startDate?: string
  endDate?: string
}

export interface WalletKpis {
  totalWalletBalance: number
  totalPointsEarned: number
  totalPointsRedeemed: number
  pendingRedemptions: number
}

interface WalletKpisApiResponse {
  success: boolean
  data: WalletKpis
}

function mapWalletKpis(response: WalletKpisApiResponse | WalletKpis): WalletKpis {
  return 'data' in response ? response.data : response
}

const walletsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallets: builder.query<Wallet[], void>({
      query: () => ({ tag: 'Wallets', url: '/wallets', mockResolver: () => mockDelay(mockWallets) }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Wallets' as const, id })), { type: 'Wallets' as const, id: 'LIST' }]
          : [{ type: 'Wallets' as const, id: 'LIST' }],
    }),

    getWalletDetail: builder.query<Wallet | undefined, string>({
      query: (id) => ({ tag: 'Wallets', url: `/wallets/${id}`, mockResolver: () => mockDelay(getWalletById(id)) }),
      providesTags: (_result, _error, id) => [{ type: 'Wallets', id }],
    }),

    getWalletKpis: builder.query<WalletKpis, WalletKpiQueryParams | void>({
      query: (params) => ({
        tag: 'Wallets',
        url: '/analytics-cards/wallet',
        params: {
          regionId: params?.regionId || undefined,
          type: params?.type || undefined,
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () => mockDelay(walletKpis),
      }),
      transformResponse: mapWalletKpis,
      providesTags: [{ type: 'Wallets', id: 'KPIS' }],
    }),

    getWalletFormOptions: builder.query<WalletFormOptions, void>({
      query: () => ({
        tag: 'Wallets',
        url: '/wallets/form-options',
        mockResolver: () => mockDelay({ walletGiftCategoryOptions }),
      }),
      providesTags: [{ type: 'Wallets', id: 'FORM_OPTIONS' }],
    }),

    adjustBalance: builder.mutation<void, { id: string; type: 'add' | 'deduct'; amount: number; reason?: string }>({
      query: ({ id, type, amount, reason }) => ({
        tag: 'Wallets',
        url: `/wallets/${id}/adjust-balance`,
        method: 'PATCH',
        data: { type, amount, reason },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Wallets', id },
        { type: 'Wallets', id: 'LIST' },
        { type: 'Wallets', id: 'KPIS' },
      ],
    }),

    exportWalletStatement: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Wallets',
        url: `/wallets/${id}/export-statement`,
        method: 'POST',
        mockResolver: () => Promise.resolve(),
      }),
    }),
  }),
})

export const {
  useGetWalletsQuery,
  useGetWalletDetailQuery,
  useGetWalletKpisQuery,
  useGetWalletFormOptionsQuery,
  useAdjustBalanceMutation,
  useExportWalletStatementMutation,
} = walletsApi
