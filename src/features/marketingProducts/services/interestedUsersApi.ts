import { baseApi } from '@/store/api/baseApi'
import type { AppDispatch } from '@/app/store'

// `getState` only needs to satisfy the api slice's own state shape (used by
// `selectCachedArgsForQuery`), so it is typed loosely here rather than tied
// to the full app `RootState` — this lets both the real store's dispatch
// context and RTK Query's internal `onQueryStarted` thunkApi (whose inferred
// state type omits unrelated slices like `auth`) satisfy this type. `dispatch`
// is typed as `AppDispatch` (a thunk-aware dispatch) since we dispatch
// `updateQueryData` thunk actions here, which a plain `Dispatch` rejects.
type ThunkApi = { dispatch: AppDispatch; getState: () => unknown }
import {
  mockInterestedUsers,
  getInterestedUserById,
  interestedUserKpis,
} from '@/features/marketingProducts/mockInterestedUsers'
import type {
  InterestedUserLead,
  LeadStatus,
  LeadUserType,
} from '@/features/marketingProducts/types/marketingProducts.types'
import { mockDelay } from '@/services/mockDelay'
import { getRegions, fallbackRegions } from '@/services/regionsService'
import type { RegionOption } from '@/contexts/RegionFilterContext'
import type { AnalyticsDateParams } from '@/utils/dateRangeToAnalyticsParams'
import { formatDate } from '@/utils/formatDate'

export interface InterestedUserKpis {
  totalInterestedUsers: number
  newLeads: number
  leadsInProgress: number
  closedConvertedLeads: number
}

export interface InterestedUserQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: LeadStatus | 'all'
  userType?: LeadUserType | 'all'
  regionId?: string
  showcaseProductId?: string
  partnerId?: string
  requestedFrom?: string
  requestedTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  preset?: string
  startDate?: string
  endDate?: string
}

interface InterestedUserListApiResponse {
  success: boolean
  data: {
    items: InterestedUserApiItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

/** Paginated list result: the mapped page of leads plus the server's grand
 *  total (`totalItems`) so the table's count reflects all matches, not just
 *  the current page. */
export interface InterestedUserListResult {
  items: InterestedUserLead[]
  totalItems: number
}

interface InterestedUserDetailApiResponse {
  success: boolean
  data: InterestedUserApiItem
}

interface InterestedUserApiItem {
  id: string
  showcaseProductId: string
  productSnapshot: {
    showcaseProductId: string
    name: string
    category: string
  }
  partnerId: string
  partnerSnapshot: {
    userId: string
    name: string
    businessName: string
    role: string
    mobile: string
  }
  regionId?: string | null
  region?: { id: string; code: string; name: string } | null
  quantityRequested: number
  stockUnit: string
  note: string
  status: string
  followedUpAt: string | null
  followedUpBy: string | null
  followedUpByDetails: {
    id: string
    name: string
    email: string
    role: string
  } | null
  followUpNote: string
  closeReason: string
  createdAt: string
  updatedAt: string
}

interface ProductInterestedUserListApiResponse {
  success: boolean
  data: {
    items: ProductInterestedUserApiItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

interface ProductInterestedUserApiItem {
  id: string
  showcaseProductId: string
  productSnapshot: {
    showcaseProductId: string
    name: string
    categoryId?: string | null
  }
  partnerId: string
  partnerSnapshot: {
    userId: string
    name: string
    businessName: string
    role: string
    mobile: string
  }
  regionDetails?: { id: string; code: string; name: string } | null
  quantityRequested: number
  stockUnit?: string
  note: string
  status: string
  followedUpAt: string | null
  followedUpBy: string | null
  followedUpByDetails: {
    id: string
    name: string
    email: string
    role: string
  } | null
  followUpNote: string
  closeReason: string | null
  createdAt: string
  updatedAt: string
}

interface InterestedUserAnalyticsApiResponse {
  success: boolean
  data: {
    stats: {
      totalInterestedUsers: number
      totalInterestedUsersChange: number
      newLeads: number
      newLeadsChange: number
      leadsInProgress: number
      leadsInProgressChange: number
      closedConvertedLeads: number
      closedConvertedLeadsChange: number
    }
  }
}

let regionCache: RegionOption[] = fallbackRegions

async function loadRegions(): Promise<RegionOption[]> {
  try {
    regionCache = await getRegions()
  } catch {
    regionCache = fallbackRegions
  }
  return regionCache
}

function mapUserType(role: string): LeadUserType {
  return role.toLowerCase() === 'dealer' ? 'Dealer' : 'Chemist'
}

function mapStatus(status: string): LeadStatus {
  const normalized = status.toLowerCase()
  if (normalized === 'new') return 'new'
  if (normalized === 'followed_up') return 'followed_up'
  return 'closed'
}

function mapStatusParam(status?: LeadStatus | 'all') {
  return status && status !== 'all' ? status : undefined
}

function mapUserTypeParam(userType?: LeadUserType | 'all') {
  if (!userType || userType === 'all') return undefined
  return userType.toLowerCase()
}

function mapAnalytics(
  response: InterestedUserAnalyticsApiResponse,
): InterestedUserKpis {
  const stats = response.data.stats
  return {
    totalInterestedUsers: stats.totalInterestedUsers,
    newLeads: stats.newLeads,
    leadsInProgress: stats.leadsInProgress,
    closedConvertedLeads: stats.closedConvertedLeads,
  }
}

function mapInterestedUserItem(
  item: InterestedUserApiItem,
): InterestedUserLead {
  return {
    id: item.id,
    showcaseProductId: item.showcaseProductId,
    interestedProduct: item.productSnapshot.name,
    productCategory: item.productSnapshot.category,
    userId: item.partnerId,
    userName: item.partnerSnapshot.name,
    businessName: item.partnerSnapshot.businessName,
    userType: mapUserType(item.partnerSnapshot.role),
    mobile: item.partnerSnapshot.mobile,
    regionId: item.region?.id ?? item.regionId ?? null,
    region: item.region?.name ?? '',
    quantityRequested: item.quantityRequested,
    stockUnit: item.stockUnit,
    note: item.note,
    leadStatus: mapStatus(item.status),
    requestedDate: formatDate(item.createdAt),
    followedUpAt: item.followedUpAt ? formatDate(item.followedUpAt) : null,
    handledBy: item.followedUpByDetails?.name ?? '',
    followUpNote: item.followUpNote,
    closeReason: item.closeReason,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function mapProductInterestedUserItem(
  item: ProductInterestedUserApiItem,
): InterestedUserLead {
  return {
    id: item.id,
    showcaseProductId: item.showcaseProductId,
    interestedProduct: item.productSnapshot.name,
    productCategory: '',
    userId: item.partnerId,
    userName: item.partnerSnapshot.name,
    businessName: item.partnerSnapshot.businessName,
    userType: mapUserType(item.partnerSnapshot.role),
    mobile: item.partnerSnapshot.mobile,
    regionId: item.regionDetails?.id ?? null,
    region: item.regionDetails?.name ?? '',
    quantityRequested: item.quantityRequested,
    stockUnit: item.stockUnit ?? '',
    note: item.note,
    leadStatus: mapStatus(item.status),
    requestedDate: formatDate(item.createdAt),
    followedUpAt: item.followedUpAt ? formatDate(item.followedUpAt) : null,
    handledBy: item.followedUpByDetails?.name ?? '',
    followUpNote: item.followUpNote,
    closeReason: item.closeReason ?? '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

/**
 * Optimistically applies `patch` to a lead in every cache entry that could be
 * showing it (the detail query for its id, plus every currently-subscribed
 * getInterestedUsers list query) without invalidating tags — so follow-up/
 * close reflect instantly with no background refetch or skeleton flash.
 * Returns undo callbacks to call on failure.
 */
function optimisticallyPatchLead(
  { dispatch, getState }: ThunkApi,
  id: string,
  patch: (lead: InterestedUserLead) => void,
) {
  const undoCallbacks: Array<() => void> = []

  undoCallbacks.push(
    dispatch(
      interestedUsersApi.util.updateQueryData(
        'getInterestedUserDetail',
        id,
        (draft) => {
          if (draft) patch(draft)
        },
      ),
    ).undo,
  )

  const listArgsList = interestedUsersApi.util.selectCachedArgsForQuery(
    getState() as Parameters<
      typeof interestedUsersApi.util.selectCachedArgsForQuery
    >[0],
    'getInterestedUsers',
  )

  for (const listArgs of listArgsList) {
    undoCallbacks.push(
      dispatch(
        interestedUsersApi.util.updateQueryData(
          'getInterestedUsers',
          listArgs,
          (draft) => {
            const lead = draft.items.find((item) => item.id === id)
            if (lead) patch(lead)
          },
        ),
      ).undo,
    )
  }

  return undoCallbacks
}

const interestedUsersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInterestedUsers: builder.query<
      InterestedUserListResult,
      InterestedUserQueryParams | void
    >({
      query: (params) => ({
        tag: 'InterestedUsers',
        url: '/showcase-products/interests',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          status: mapStatusParam(params?.status),
          userType: mapUserTypeParam(params?.userType),
          regionId: params?.regionId || undefined,
          showcaseProductId: params?.showcaseProductId || undefined,
          partnerId: params?.partnerId || undefined,
          requestedFrom: params?.requestedFrom || undefined,
          requestedTo: params?.requestedTo || undefined,
          sortBy: params?.sortBy || 'createdAt',
          sortOrder: params?.sortOrder ?? 'desc',
          preset:
            params?.requestedFrom || params?.requestedTo
              ? undefined
              : params?.preset || undefined,
          startDate:
            params?.requestedFrom || params?.requestedTo
              ? undefined
              : params?.startDate || undefined,
          endDate:
            params?.requestedFrom || params?.requestedTo
              ? undefined
              : params?.endDate || undefined,
        },
        mockResolver: () => mockDelay(mockInterestedUsers),
      }),
      transformResponse: async (
        response: InterestedUserListApiResponse | InterestedUserLead[],
      ): Promise<InterestedUserListResult> => {
        if (Array.isArray(response))
          return { items: response, totalItems: response.length }
        await loadRegions()
        return {
          items: response.data.items.map(mapInterestedUserItem),
          totalItems: response.data.totalItems,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: 'InterestedUsers' as const,
                id,
              })),
              { type: 'InterestedUsers' as const, id: 'LIST' },
            ]
          : [{ type: 'InterestedUsers' as const, id: 'LIST' }],
    }),

    getInterestedUserDetail: builder.query<
      InterestedUserLead | undefined,
      string
    >({
      query: (id) => ({
        tag: 'InterestedUsers',
        url: `/showcase-products/interests/${id}`,
        mockResolver: () => mockDelay(getInterestedUserById(id)),
      }),
      transformResponse: async (
        response:
          InterestedUserDetailApiResponse | InterestedUserLead | undefined,
      ) => {
        if (!response || !('data' in response)) return response
        await loadRegions()
        return mapInterestedUserItem(response.data)
      },
      providesTags: (_result, _error, id) => [{ type: 'InterestedUsers', id }],
    }),

    /** Interested users scoped to a single product, for the product details page. */
    getShowcaseProductInterestedUsers: builder.query<
      InterestedUserLead[],
      {
        showcaseProductId: string
        page?: number
        limit?: number
        search?: string
        userType?: LeadUserType | 'all'
      }
    >({
      query: ({ showcaseProductId, page, limit, search, userType }) => ({
        tag: 'InterestedUsers',
        url: `/showcase-products/${showcaseProductId}/interested-users`,
        params: {
          page: page ?? 1,
          limit: limit ?? 10,
          search: search || undefined,
          userType: mapUserTypeParam(userType),
        },
        mockResolver: () =>
          mockDelay(
            mockInterestedUsers.filter((lead) => {
              const matchesProduct = lead.showcaseProductId === showcaseProductId
              const matchesUserType =
                !userType || userType === 'all' || lead.userType === userType
              const query = search?.trim().toLowerCase()
              const matchesSearch =
                !query ||
                lead.userName.toLowerCase().includes(query) ||
                lead.businessName.toLowerCase().includes(query)
              return matchesProduct && matchesUserType && matchesSearch
            }),
          ),
      }),
      transformResponse: async (
        response: ProductInterestedUserListApiResponse | InterestedUserLead[],
      ) => {
        if (Array.isArray(response)) return response
        await loadRegions()
        return response.data.items.map(mapProductInterestedUserItem)
      },
      providesTags: (result, _error, { showcaseProductId }) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'InterestedUsers' as const,
                id,
              })),
              { type: 'InterestedUsers' as const, id: `PRODUCT_${showcaseProductId}` },
            ]
          : [{ type: 'InterestedUsers' as const, id: `PRODUCT_${showcaseProductId}` }],
    }),

    getInterestedUserAnalytics: builder.query<
      InterestedUserKpis,
      AnalyticsDateParams & { regionId?: string }
    >({
      query: (params) => ({
        tag: 'InterestedUsers',
        url: '/analytics-cards/interested-users',
        params: {
          preset: params.preset,
          startDate: params.startDate,
          endDate: params.endDate,
          regionId: params.regionId || undefined,
        },
        mockResolver: () => mockDelay(interestedUserKpis),
      }),
      transformResponse: (
        response: InterestedUserAnalyticsApiResponse | InterestedUserKpis,
      ) => ('data' in response ? mapAnalytics(response) : response),
      providesTags: [{ type: 'InterestedUsers', id: 'KPIS' }],
    }),

    followUpLead: builder.mutation<
      void,
      { id: string; followUpNote: string; closeReason?: string }
    >({
      query: ({ id, followUpNote, closeReason }) => ({
        tag: 'InterestedUsers',
        url: `/showcase-products/interests/${id}/follow-up`,
        method: 'PATCH',
        data: { followUpNote, closeReason },
        mockResolver: () => Promise.resolve(),
      }),
      onQueryStarted: async ({ id, followUpNote }, thunkApi) => {
        const { queryFulfilled } = thunkApi
        const patches = optimisticallyPatchLead(thunkApi, id, (lead) => {
          lead.leadStatus = 'followed_up'
          lead.followUpNote = followUpNote
        })
        try {
          await queryFulfilled
        } catch {
          patches.forEach((undo) => undo())
        }
      },
      invalidatesTags: [{ type: 'InterestedUsers', id: 'KPIS' }],
    }),

    closeLead: builder.mutation<void, { id: string; closeReason: string }>({
      query: ({ id, closeReason }) => ({
        tag: 'InterestedUsers',
        url: `/showcase-products/interests/${id}/close`,
        method: 'PATCH',
        data: { closeReason },
        mockResolver: () => Promise.resolve(),
      }),
      onQueryStarted: async ({ id, closeReason }, thunkApi) => {
        const { queryFulfilled } = thunkApi
        const patches = optimisticallyPatchLead(thunkApi, id, (lead) => {
          lead.leadStatus = 'closed'
          lead.closeReason = closeReason
        })
        try {
          await queryFulfilled
        } catch {
          patches.forEach((undo) => undo())
        }
      },
      invalidatesTags: [{ type: 'InterestedUsers', id: 'KPIS' }],
    }),

    deleteLead: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'InterestedUsers',
        url: `/showcase-products/interests/${id}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'InterestedUsers', id },
        { type: 'InterestedUsers', id: 'LIST' },
        { type: 'InterestedUsers', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetInterestedUsersQuery,
  useGetInterestedUserDetailQuery,
  useGetShowcaseProductInterestedUsersQuery,
  useGetInterestedUserAnalyticsQuery,
  useFollowUpLeadMutation,
  useCloseLeadMutation,
  useDeleteLeadMutation,
} = interestedUsersApi
