// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockGeoFences,
  getGeoFenceById,
  geoFenceUserOptions,
} from '@/features/fieldOperations/mocks/mockGeoFences'
import type {
  GeoFence,
  GeoFenceFormValues,
  GeoFenceUserType,
} from '@/features/fieldOperations/types/fieldOperations.types'
import type { PartnerZone } from '@/types/partner'
import type { AnalyticsDateParams } from '@/utils/dateRangeToAnalyticsParams'
import { mockDelay } from '@/services/mockDelay'
import { formatDate } from '@/utils/formatDate'

export type GeoFenceUserOption = (typeof geoFenceUserOptions)[number]

export interface GeoFenceAnalyticsCards {
  activeGeoFences: number
  pendingVerification: number
  averageRadius: number
  averageBufferRadius: number
}

interface GeoFenceAnalyticsCardsApiResponse {
  success: boolean
  message?: string
  data: GeoFenceAnalyticsCards
}

const emptyGeoFenceAnalyticsCards: GeoFenceAnalyticsCards = {
  activeGeoFences: 0,
  pendingVerification: 0,
  averageRadius: 0,
  averageBufferRadius: 0,
}

type PartnerType = 'DEALER' | 'CHEMIST'

export interface GeoFenceQueryParams extends Partial<AnalyticsDateParams> {
  regionId?: string
  userType?: 'Dealer' | 'Chemist'
  search?: string
  page?: number
  limit?: number
  zone?: 'North' | 'South' | 'East' | 'West'
  status?: 'active' | 'pending' | 'inactive'
}

interface PartnerBusinessApiItem {
  id: string
  outletName?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  landmark?: string | null
  city?: string | null
  district?: string | null
  state?: string | null
  pincode?: string | null
  latitude?: number | null
  longitude?: number | null
  scanRadius?: number | null
  bufferRadius?: number | null
}

interface PartnerApiItem {
  id: string
  businessName?: string | null
  ownerName?: string | null
  type: PartnerType
  region?: {
    id: string
    code?: string | null
    name?: string | null
  } | null
  status?: string | null
  approvalStatus?: string | null
  isBlocked?: boolean
  updatedAt?: string | null
  business?: PartnerBusinessApiItem[]
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

const partnerUserTypeMap: Record<PartnerType, GeoFenceUserType> = {
  DEALER: 'Dealer',
  CHEMIST: 'Chemist',
}

function inferZone(state?: string | null): PartnerZone {
  const normalized = state?.toLowerCase() ?? ''
  if (
    ['delhi', 'haryana', 'punjab', 'uttar pradesh'].some((s) =>
      normalized.includes(s),
    )
  )
    return 'North'
  if (
    ['tamil', 'kerala', 'karnataka', 'telangana', 'andhra'].some((s) =>
      normalized.includes(s),
    )
  )
    return 'South'
  if (
    ['west bengal', 'odisha', 'bihar', 'assam'].some((s) =>
      normalized.includes(s),
    )
  )
    return 'East'
  return 'West'
}

function mapRegionToZone(
  region: PartnerApiItem['region'],
  fallbackState?: string | null,
): PartnerZone {
  const normalized = `${region?.name ?? ''} ${region?.code ?? ''}`.toLowerCase()

  if (normalized.includes('north')) return 'North'
  if (normalized.includes('south')) return 'South'
  if (normalized.includes('east')) return 'East'
  if (normalized.includes('west')) return 'West'

  return inferZone(fallbackState)
}

function mapPartnerStatus(
  status?: string | null,
  isBlocked?: boolean,
): GeoFence['status'] {
  if (isBlocked) return 'inactive'
  if (status === 'PENDING_APPROVAL') return 'pending'
  if (status === 'ACTIVE') return 'active'
  return 'inactive'
}

function mapPartnerToGeoFence(item: PartnerApiItem): GeoFence {
  const business = item.business?.[0]
  const address = [
    business?.addressLine1,
    business?.addressLine2,
    business?.landmark,
    business?.city,
    business?.district,
    business?.state,
    business?.pincode,
  ]
    .filter(Boolean)
    .join(', ')
  const zone = mapRegionToZone(item.region, business?.state)

  return {
    id: item.id,
    scope: 'user',
    userName: item.ownerName?.trim() || 'Unknown',
    businessName: item.businessName ?? business?.outletName ?? '-',
    businessAddress: address || '-',
    userType: partnerUserTypeMap[item.type],
    linkedUserId: item.id,
    businessId: business?.id,
    region: zone,
    zone,
    latitude: business?.latitude ?? 0,
    longitude: business?.longitude ?? 0,
    radiusMeters: business?.scanRadius ?? 0,
    bufferDistanceMeters: business?.bufferRadius ?? 0,
    lastVerified: formatDate(item.updatedAt),
    status: mapPartnerStatus(item.status, item.isBlocked),
    verificationHistory: [],
    scanHistory: [],
    timeline: [],
    auditHistory: [],
  }
}

function buildSharedListParams(arg: GeoFenceQueryParams | void) {
  return {
    page: arg?.page ?? 1,
    limit: arg?.limit ?? 1000,
    regionId: arg?.regionId || undefined,
    preset: arg?.preset || undefined,
    startDate: arg?.startDate || undefined,
    endDate: arg?.endDate || undefined,
    search: arg?.search || undefined,
  }
}

function mapStatusParam(status?: string) {
  if (!status || status === 'all') return undefined
  if (status === 'active') return 'ACTIVE'
  if (status === 'pending') return 'PENDING_APPROVAL'
  if (status === 'inactive') return 'INACTIVE'
  return status
}

// create/update/setStatus/deleteGeoFence are currently no-ops resolving
// immediately so the UI/hook contract is stable ahead of the real API.

const geoFencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGeoFences: builder.query<GeoFence[], GeoFenceQueryParams | void>({
      queryFn: async (arg, _api, _extra, baseQuery) => {
        const sharedParams = buildSharedListParams(arg)
        const type: PartnerType | undefined =
          arg?.userType === 'Dealer'
            ? 'DEALER'
            : arg?.userType === 'Chemist'
              ? 'CHEMIST'
              : undefined

        const response = await baseQuery({
          tag: 'GeoFences',
          url: '/partners',
          params: {
            ...sharedParams,
            type,
            status: arg?.status ? mapStatusParam(arg.status) : undefined,
          },
          mockResolver: () =>
            mockDelay({
              success: true,
              data: {
                items: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: 1,
                pageSize: 0,
              },
            }),
        })

        if (response.error) return { error: response.error }

        const data = response.data as PartnerListApiResponse | GeoFence[]
        if (Array.isArray(data)) {
          const all = mockGeoFences.filter((fence) => {
            const matchesType =
              !arg?.userType || fence.userType === arg.userType
            const matchesSearch =
              !arg?.search ||
              `${fence.businessName} ${fence.userName} ${fence.zone}`
                .toLowerCase()
                .includes(arg.search.toLowerCase())
            const matchesZone = !arg?.zone || fence.zone === arg.zone
            const matchesStatus = !arg?.status || fence.status === arg.status
            return matchesType && matchesSearch && matchesZone && matchesStatus
          })
          const page = arg?.page ?? 1
          const limit = arg?.limit ?? 1000
          const start = (page - 1) * limit
          const paged = all.slice(start, start + limit) as GeoFence[] & {
            totalItems?: number
          }
          paged.totalItems = all.length
          return { data: paged }
        }

        let mapped = data.data.items.map(mapPartnerToGeoFence)
        if (arg?.zone) {
          mapped = mapped.filter((fence) => fence.zone === arg.zone)
        }
        const paged = mapped as GeoFence[] & {
          totalItems?: number
        }
        paged.totalItems = data.data.totalItems
        return { data: paged }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'GeoFences' as const, id })),
              { type: 'GeoFences' as const, id: 'LIST' },
            ]
          : [{ type: 'GeoFences' as const, id: 'LIST' }],
    }),

    getGeoFenceDetail: builder.query<GeoFence | undefined, string>({
      query: (id) => ({
        tag: 'GeoFences',
        url: `/geo-fences/${id}`,
        mockResolver: () => mockDelay(getGeoFenceById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'GeoFences', id }],
    }),

    getGeoFenceAnalyticsCards: builder.query<
      GeoFenceAnalyticsCards,
      GeoFenceQueryParams | void
    >({
      query: (params) => ({
        tag: 'GeoFences',
        url: '/analytics-cards/geo-fence',
        params: {
          regionId: params?.regionId || undefined,
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
          // forward userType to the analytics endpoint when provided
          userType: params?.userType || undefined,
        },
        mockResolver: () => mockDelay(emptyGeoFenceAnalyticsCards),
      }),
      transformResponse: (
        response: GeoFenceAnalyticsCardsApiResponse | GeoFenceAnalyticsCards,
      ) => ('data' in response ? response.data : response),
      providesTags: (_result, _error, _arg) => [
        { type: 'GeoFences', id: 'ANALYTICS_CARDS' },
      ],
    }),

    getGeoFenceUserOptions: builder.query<GeoFenceUserOption[], void>({
      query: () => ({
        tag: 'GeoFences',
        url: '/geo-fences/user-options',
        mockResolver: () => mockDelay(geoFenceUserOptions),
      }),
      providesTags: [{ type: 'GeoFences', id: 'USER_OPTIONS' }],
    }),

    createGeoFence: builder.mutation<void, GeoFenceFormValues>({
      query: (values) => ({
        tag: 'GeoFences',
        url: '/geo-fences',
        method: 'POST',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [
        { type: 'GeoFences', id: 'LIST' },
        { type: 'GeoFences', id: 'ANALYTICS_CARDS' },
      ],
    }),

    updateGeoFence: builder.mutation<
      void,
      { id: string; values: GeoFenceFormValues }
    >({
      query: ({ id, values }) => ({
        tag: 'GeoFences',
        url: `/geo-fences/${id}`,
        method: 'PUT',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'GeoFences', id },
        { type: 'GeoFences', id: 'LIST' },
        { type: 'GeoFences', id: 'ANALYTICS_CARDS' },
      ],
    }),

    setGeoFenceStatus: builder.mutation<
      void,
      { id: string; status: 'active' | 'inactive' }
    >({
      query: ({ id, status }) => ({
        tag: 'GeoFences',
        url: `/geo-fences/${id}/status`,
        method: 'PATCH',
        data: { status },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'GeoFences', id },
        { type: 'GeoFences', id: 'LIST' },
        { type: 'GeoFences', id: 'ANALYTICS_CARDS' },
      ],
    }),

    deleteGeoFence: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'GeoFences',
        url: `/geo-fences/${id}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'GeoFences', id },
        { type: 'GeoFences', id: 'LIST' },
        { type: 'GeoFences', id: 'ANALYTICS_CARDS' },
      ],
    }),
  }),
})

export const {
  useGetGeoFencesQuery,
  useGetGeoFenceDetailQuery,
  useGetGeoFenceAnalyticsCardsQuery,
  useGetGeoFenceUserOptionsQuery,
  useCreateGeoFenceMutation,
  useUpdateGeoFenceMutation,
  useSetGeoFenceStatusMutation,
  useDeleteGeoFenceMutation,
} = geoFencesApi
