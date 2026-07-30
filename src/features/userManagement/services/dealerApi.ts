import { baseApi } from '@/store/api/baseApi'
import { mockDealers, dealerKpis, getDealerById } from '@/features/userManagement/mockDealers'
import type { Dealer } from '@/types/dealer'
import type { DealerApiPayload } from '@/features/userManagement/dealerFormSchema'
import { mockDelay } from '@/services/mockDelay'
import type { OnboardedBy, PartnerStatus, PartnerZone } from '@/types/partner'

export interface DealerQueryParams {
  page?: number
  limit?: number
  search?: string
  regionId?: string
  assignedMedicalRepresentativeId?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface PartnerListApiResponse {
  success: boolean
  data: {
    items: PartnerDealerItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

interface PartnerDetailApiResponse {
  success: boolean
  data: PartnerDealerItem
}

interface PartnerDealerItem {
  profile: {
    id: string
    type: string
    ownerFirstName?: string | null
    ownerLastName?: string | null
    email?: string | null
    phone?: string | null
    country?: string | null
    status?: string | null
    isBlocked?: boolean
  }
  business?: Array<{
    id: string
    businessName?: string | null
    gstNumber?: string | null
    drugLicenseNumber?: string | null
    addressLine1?: string | null
    addressLine2?: string | null
    city?: string | null
    district?: string | null
    state?: string | null
    pincode?: string | null
    latitude?: number | null
    longitude?: number | null
    regionId?: string | null
    assignedMedicalRepresentativeId?: string | null
    onboardedByType?: string | null
  }>
}

function mapStatus(status?: string | null, isBlocked?: boolean): PartnerStatus {
  if (isBlocked) return 'inactive'
  if (status === 'ACTIVE') return 'active'
  if (status === 'PENDING_APPROVAL') return 'pending'
  if (status === 'SUSPENDED') return 'suspended'
  return 'inactive'
}

function inferZone(state?: string | null): PartnerZone {
  const normalized = state?.toLowerCase() ?? ''

  if (
    ['delhi', 'haryana', 'punjab', 'uttar pradesh'].some((s) =>
      normalized.includes(s),
    )
  ) {
    return 'North'
  }
  if (
    ['tamil', 'kerala', 'karnataka', 'telangana', 'andhra'].some((s) =>
      normalized.includes(s),
    )
  ) {
    return 'South'
  }
  if (
    ['west bengal', 'odisha', 'bihar', 'assam'].some((s) =>
      normalized.includes(s),
    )
  ) {
    return 'East'
  }
  return 'West'
}

function mapOnboardedBy(value?: string | null): OnboardedBy {
  return value === 'MR' ? 'MR' : 'Self'
}

function mapPartnerDealer(item: PartnerDealerItem): Dealer {
  const business = item.business?.[0]
  const ownerName =
    [item.profile.ownerFirstName, item.profile.ownerLastName]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Unknown'
  const address = [
    business?.addressLine1,
    business?.addressLine2,
    business?.city,
    business?.district,
    business?.state,
    business?.pincode,
  ]
    .filter(Boolean)
    .join(', ')

  const geoLock = {
    active: Boolean(business?.latitude && business?.longitude),
    latitude: business?.latitude ?? 0,
    longitude: business?.longitude ?? 0,
    allowedRadiusMeters: 100,
    lastVerifiedDate: '-',
    bufferRadiusMeters: 10,
  }

  return {
    id: item.profile.id,
    shopName: business?.businessName ?? ownerName,
    ownerName,
    email: item.profile.email ?? '-',
    phone: item.profile.phone ?? '-',
    city: business?.city ?? '-',
    zone: inferZone(business?.state),
    status: mapStatus(item.profile.status, item.profile.isBlocked),
    licenseNumber: business?.gstNumber ?? business?.drugLicenseNumber ?? '-',
    onboardedBy: mapOnboardedBy(business?.onboardedByType),
    availablePoints: 0,
    assignedMr: business?.assignedMedicalRepresentativeId ?? '-',
    registeredAddress: address || '-',
    totalScans: 0,
    totalRedemptions: 0,
    scanHistory: [],
    PointsHistory: [],
    interestedProducts: [],
    documents: [],
    geoLock,
    activeOrders: 0,
    liveDeliveries: false,
    godowns: business
      ? [
          {
            id: business.id,
            name: business.businessName ?? 'Godown',
            address: address || '-',
            geoLock,
          },
        ]
      : [],
  }
}

function mapStatusParam(status?: string) {
  if (!status || status === 'all') return undefined
  if (status === 'active') return 'ACTIVE'
  if (status === 'pending') return 'PENDING_APPROVAL'
  if (status === 'inactive') return 'INACTIVE'
  if (status === 'suspended') return 'SUSPENDED'
  return status
}

const dealerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDealers: builder.query<Dealer[], DealerQueryParams | void>({
      query: (params) => ({
        tag: 'Partners',
        url: '/partners',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          type: 'DEALER',
          regionId: params?.regionId || undefined,
          assignedMedicalRepresentativeId:
            params?.assignedMedicalRepresentativeId || undefined,
          status: mapStatusParam(params?.status),
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder ?? 'desc',
        },
        mockResolver: () => mockDelay(mockDealers),
      }),
      transformResponse: (response: PartnerListApiResponse | Dealer[]) =>
        Array.isArray(response)
          ? response
          : response.data.items.map(mapPartnerDealer),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Partners' as const, id })),
              { type: 'Partners' as const, id: 'LIST' },
            ]
          : [{ type: 'Partners' as const, id: 'LIST' }],
    }),

    getDealerDetail: builder.query<Dealer | undefined, string>({
      query: (id) => ({
        tag: 'Partners',
        url: `/partners/${id}`,
        mockResolver: () => mockDelay(getDealerById(id)),
      }),
      transformResponse: (response: PartnerDetailApiResponse | Dealer | undefined) =>
        response && 'data' in response
          ? mapPartnerDealer(response.data)
          : response,
      providesTags: (_result, _error, id) => [{ type: 'Partners', id }],
    }),

    getDealerKpis: builder.query<typeof dealerKpis, void>({
      query: () => ({
        tag: 'Partners',
        url: '/dealers/kpis',
        mockResolver: () => mockDelay(dealerKpis),
      }),
      providesTags: [{ type: 'Partners', id: 'KPIS' }],
    }),

    activateDealer: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Partners',
        url: `/partners/${id}/activate`,
        method: 'PATCH',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Partners', id },
        { type: 'Partners', id: 'LIST' },
        { type: 'Partners', id: 'KPIS' },
      ],
    }),

    deactivateDealer: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Partners',
        url: `/partners/${id}/deactivate`,
        method: 'PATCH',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Partners', id },
        { type: 'Partners', id: 'LIST' },
        { type: 'Partners', id: 'KPIS' },
      ],
    }),

    createDealer: builder.mutation<void, DealerApiPayload>({
      query: (payload) => ({
        tag: 'Partners',
        url: '/partners/create',
        method: 'POST',
        data: payload,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [
        { type: 'Partners', id: 'LIST' },
        { type: 'Partners', id: 'KPIS' },
      ],
    }),

    updateDealer: builder.mutation<void, { id: string; payload: DealerApiPayload }>({
      query: ({ id, payload }) => ({
        tag: 'Partners',
        url: `/partners/${id}`,
        method: 'PUT',
        data: payload,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Partners', id },
        { type: 'Partners', id: 'LIST' },
        { type: 'Partners', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetDealersQuery,
  useGetDealerDetailQuery,
  useGetDealerKpisQuery,
  useActivateDealerMutation,
  useDeactivateDealerMutation,
  useCreateDealerMutation,
  useUpdateDealerMutation,
} = dealerApi
