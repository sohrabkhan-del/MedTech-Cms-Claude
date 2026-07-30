import { baseApi } from '@/store/api/baseApi'
import {
  mockChemists,
  chemistKpis,
  getChemistById,
} from '@/features/userManagement/mockChemists'
import type {
  Chemist,
  ChemistKpis,
} from '@/features/userManagement/types/userManagement.types'
import type { ChemistApiPayload } from '@/features/userManagement/chemistFormSchema'
import { mockDelay } from '@/services/mockDelay'
import type { OnboardedBy, PartnerStatus, PartnerZone } from '@/types/partner'

export interface ChemistQueryParams {
  page?: number
  limit?: number
  search?: string
  regionId?: string
  territoryId?: string
  assignedMedicalRepresentativeId?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface PartnerListApiResponse {
  success: boolean
  data: {
    items: PartnerChemistItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

interface PartnerDetailApiResponse {
  success: boolean
  data: PartnerChemistItem
}

interface PartnerChemistItem {
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

function mapPartnerChemist(item: PartnerChemistItem): Chemist {
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
    geoLock: {
      active: Boolean(business?.latitude && business?.longitude),
      latitude: business?.latitude ?? 0,
      longitude: business?.longitude ?? 0,
      allowedRadiusMeters: 100,
      lastVerifiedDate: '-',
      bufferRadiusMeters: 10,
    },
    geoTagStatus:
      business?.latitude && business?.longitude ? 'tagged' : 'pending',
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

const chemistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChemists: builder.query<Chemist[], ChemistQueryParams | void>({
      query: (params) => ({
        tag: 'Chemists',
        url: '/partners',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          type: 'CHEMIST',
          regionId: params?.regionId || undefined,
          territoryId: params?.territoryId || undefined,
          assignedMedicalRepresentativeId:
            params?.assignedMedicalRepresentativeId || undefined,
          status: mapStatusParam(params?.status),
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder ?? 'desc',
        },
        mockResolver: () => mockDelay(mockChemists),
      }),
      transformResponse: (response: PartnerListApiResponse | Chemist[]) =>
        Array.isArray(response)
          ? response
          : response.data.items.map(mapPartnerChemist),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Chemists' as const, id })),
              { type: 'Chemists' as const, id: 'LIST' },
            ]
          : [{ type: 'Chemists' as const, id: 'LIST' }],
    }),

    getChemistDetail: builder.query<Chemist | undefined, string>({
      query: (id) => ({
        tag: 'Chemists',
        url: `/partners/${id}`,
        mockResolver: () => mockDelay(getChemistById(id)),
      }),
      transformResponse: (response: PartnerDetailApiResponse | Chemist | undefined) =>
        response && 'data' in response
          ? mapPartnerChemist(response.data)
          : response,
      providesTags: (_result, _error, id) => [{ type: 'Chemists', id }],
    }),

    getChemistKpis: builder.query<ChemistKpis, void>({
      query: () => ({
        tag: 'Chemists',
        url: '/chemists/kpis',
        mockResolver: () => mockDelay(chemistKpis),
      }),
      providesTags: [{ type: 'Chemists', id: 'KPIS' }],
    }),

    activateChemist: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Chemists',
        url: `/partners/${id}/activate`,
        method: 'PATCH',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Chemists', id },
        { type: 'Chemists', id: 'LIST' },
        { type: 'Chemists', id: 'KPIS' },
      ],
    }),

    deactivateChemist: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Chemists',
        url: `/partners/${id}/deactivate`,
        method: 'PATCH',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Chemists', id },
        { type: 'Chemists', id: 'LIST' },
        { type: 'Chemists', id: 'KPIS' },
      ],
    }),

    createChemist: builder.mutation<void, ChemistApiPayload>({
      query: (payload) => ({
        tag: 'Chemists',
        url: '/partners/create',
        method: 'POST',
        data: payload,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [
        { type: 'Chemists', id: 'LIST' },
        { type: 'Chemists', id: 'KPIS' },
      ],
    }),

    updateChemist: builder.mutation<void, { id: string; payload: ChemistApiPayload }>({
      query: ({ id, payload }) => ({
        tag: 'Chemists',
        url: `/partners/${id}`,
        method: 'PUT',
        data: payload,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Chemists', id },
        { type: 'Chemists', id: 'LIST' },
        { type: 'Chemists', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetChemistsQuery,
  useGetChemistDetailQuery,
  useGetChemistKpisQuery,
  useActivateChemistMutation,
  useDeactivateChemistMutation,
  useCreateChemistMutation,
  useUpdateChemistMutation,
} = chemistApi
