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
import type {
  LicenseDocument,
  OnboardedBy,
  PartnerBusinessDetail,
  PartnerStatus,
  PartnerZone,
} from '@/types/partner'
import type { AnalyticsDateParams } from '@/utils/dateRangeToAnalyticsParams'

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
  preset?: string
  startDate?: string
  endDate?: string
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

interface PartnerDocumentApiItem {
  id: string
  name: string
  size?: number
  path: string
  type?: string
}

interface PartnerChemistItem {
  id: string
  referenceId?: string | null
  businessName?: string | null
  ownerName?: string | null
  profileImage?: PartnerDocumentApiItem | null
  email?: string | null
  phone?: string | null
  country?: string | null
  gstNumber?: string | null
  regionId?: string | null
  assignedMedicalRepresentativeId?: string | null
  notes?: string | null
  status?: string | null
  approvalStatus?: string | null
  isBlocked?: boolean
  business?: Array<{
    id: string
    outletName?: string | null
    userName?: string | null
    panNumber?: string | null
    drugLicenseNumber?: string | null
    drugLicenseExpiry?: string | null
    addressType?: string | null
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
    geoAccuracy?: number | null
    regionId?: string | null
    onboardedByType?: string | null
    notes?: string | null
    documents?: PartnerDocumentApiItem[]
  }>
}

function mapPartnerDocuments(
  businesses?: PartnerChemistItem['business'],
): LicenseDocument[] {
  if (!businesses) return []
  return businesses.flatMap((b) =>
    (b.documents ?? []).map((doc) => ({
      id: doc.id,
      documentName:
        businesses.length > 1 && b.outletName
          ? `${b.outletName} · ${doc.name}`
          : doc.name,
      uploadDate: '-',
      verificationStatus: 'pending' as const,
      expiryDate: '-',
      fileUrl: doc.path,
    })),
  )
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

function mapPartnerBusinesses(
  business: PartnerChemistItem['business'],
): PartnerBusinessDetail[] {
  if (!business) return []
  return business.map((b) => ({
    outletName: b.outletName ?? '',
    userName: b.userName ?? undefined,
    panNumber: b.panNumber ?? undefined,
    drugLicenseNumber: b.drugLicenseNumber ?? undefined,
    drugLicenseExpiry: b.drugLicenseExpiry ?? undefined,
    addressType:
      b.addressType === 'SHOP' ||
      b.addressType === 'GODOWN' ||
      b.addressType === 'OTHER'
        ? b.addressType
        : undefined,
    addressLine1: b.addressLine1 ?? undefined,
    addressLine2: b.addressLine2 ?? undefined,
    landmark: b.landmark ?? undefined,
    city: b.city ?? undefined,
    district: b.district ?? undefined,
    state: b.state ?? undefined,
    country: b.country ?? undefined,
    pincode: b.pincode ?? undefined,
    latitude: b.latitude ?? undefined,
    longitude: b.longitude ?? undefined,
    scanRadius: b.scanRadius ?? undefined,
    bufferRadius: b.bufferRadius ?? undefined,
    geoAccuracy: b.geoAccuracy ?? undefined,
    regionId: b.regionId ?? undefined,
    notes: b.notes ?? undefined,
  }))
}

function mapPartnerChemist(item: PartnerChemistItem): Chemist {
  const business = item.business?.[0]
  const ownerName = item.ownerName?.trim() || 'Unknown'
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

  return {
    id: item.id,
    referenceId: item.referenceId ?? undefined,
    shopName: item.businessName ?? business?.outletName ?? ownerName,
    ownerName,
    email: item.email ?? '-',
    phone: item.phone ?? '-',
    country: item.country ?? undefined,
    city: business?.city ?? '-',
    zone: inferZone(business?.state),
    status: mapStatus(item.status, item.isBlocked),
    approvalStatus: item.approvalStatus ?? undefined,
    profileImageUrl: item.profileImage?.path ?? undefined,
    licenseNumber: item.gstNumber ?? business?.drugLicenseNumber ?? '-',
    panNumber: business?.panNumber ?? undefined,
    drugLicenseNumber: business?.drugLicenseNumber ?? undefined,
    drugLicenseExpiry: business?.drugLicenseExpiry ?? undefined,
    regionId: item.regionId ?? undefined,
    onboardedBy: mapOnboardedBy(business?.onboardedByType),
    availablePoints: 0,
    assignedMr: item.assignedMedicalRepresentativeId ?? '-',
    notes: item.notes ?? undefined,
    registeredAddress: address || '-',
    totalScans: 0,
    totalRedemptions: 0,
    scanHistory: [],
    PointsHistory: [],
    interestedProducts: [],
    documents: mapPartnerDocuments(item.business),
    businesses: mapPartnerBusinesses(item.business),
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

interface PartnerAnalyticsApiResponse {
  success: boolean
  data: {
    type: string
    totalPartners: number
    activePartners: number
    inactivePartners: number
    pendingApprovalPartners: number
    newPartnersInRange: number
    newPartnersChange: number
  }
}

function mapPartnerAnalytics(
  response: PartnerAnalyticsApiResponse,
): ChemistKpis {
  const data = response.data
  return {
    totalChemists: data.totalPartners,
    activeChemists: data.activePartners,
    inactiveChemists: data.inactivePartners,
    pendingApproval: data.pendingApprovalPartners,
  }
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
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
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
      transformResponse: (
        response: PartnerDetailApiResponse | Chemist | undefined,
      ) =>
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

    getChemistAnalytics: builder.query<
      ChemistKpis,
      AnalyticsDateParams & { regionId?: string }
    >({
      query: (params) => ({
        tag: 'Chemists',
        url: '/analytics-cards/partners/CHEMIST',
        params: {
          preset: params.preset,
          startDate: params.startDate,
          endDate: params.endDate,
          regionId: params.regionId || undefined,
        },
        mockResolver: () => mockDelay(chemistKpis),
      }),
      transformResponse: (
        response: PartnerAnalyticsApiResponse | ChemistKpis,
      ) => ('data' in response ? mapPartnerAnalytics(response) : response),
      providesTags: [{ type: 'Chemists', id: 'ANALYTICS' }],
    }),

    activateChemist: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Chemists',
        url: `/partners/${id}/activate`,
        method: 'PATCH',
        mockResolver: () => Promise.resolve(),
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const detailPatch = dispatch(
          chemistApi.util.updateQueryData('getChemistDetail', id, (draft) => {
            if (draft) {
              draft.status = 'active'
            }
          }),
        )

        const listPatch = dispatch(
          chemistApi.util.updateQueryData('getChemists', undefined, (draft) => {
            if (!draft) return

            const item = draft.find((entry) => entry.id === id)
            if (item) {
              item.status = 'active'
            }
          }),
        )

        try {
          await queryFulfilled
        } catch {
          detailPatch.undo()
          listPatch.undo()
        }
      },
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
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const detailPatch = dispatch(
          chemistApi.util.updateQueryData('getChemistDetail', id, (draft) => {
            if (draft) {
              draft.status = 'inactive'
            }
          }),
        )

        const listPatch = dispatch(
          chemistApi.util.updateQueryData('getChemists', undefined, (draft) => {
            if (!draft) return

            const item = draft.find((entry) => entry.id === id)
            if (item) {
              item.status = 'inactive'
            }
          }),
        )

        try {
          await queryFulfilled
        } catch {
          detailPatch.undo()
          listPatch.undo()
        }
      },
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

    updateChemist: builder.mutation<
      void,
      { id: string; payload: ChemistApiPayload }
    >({
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

    deleteChemist: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Chemists',
        url: `/partners/${id}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
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
  useGetChemistAnalyticsQuery,
  useActivateChemistMutation,
  useDeactivateChemistMutation,
  useCreateChemistMutation,
  useUpdateChemistMutation,
  useDeleteChemistMutation,
} = chemistApi
