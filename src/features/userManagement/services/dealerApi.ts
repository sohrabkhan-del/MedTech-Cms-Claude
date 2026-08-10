import { baseApi } from '@/store/api/baseApi'
import {
  mockDealers,
  dealerKpis,
  getDealerById,
} from '@/features/userManagement/mockDealers'
import type { Dealer } from '@/types/dealer'
import type { DealerApiPayload } from '@/features/userManagement/dealerFormSchema'
import { mockDelay } from '@/services/mockDelay'
import type {
  LicenseDocument,
  OnboardedBy,
  PartnerBusinessDetail,
  PartnerStatus,
  PartnerZone,
} from '@/types/partner'
import type { AnalyticsDateParams } from '@/utils/dateRangeToAnalyticsParams'

export type DealerKpis = typeof dealerKpis

export interface DealerQueryParams {
  page?: number
  limit?: number
  search?: string
  regionId?: string
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

interface PartnerDocumentApiItem {
  id: string
  name: string
  size?: number
  path: string
  type?: string
}

interface PartnerRegionApiItem {
  id: string
  code?: string | null
  name?: string | null
  isActive?: boolean
}

interface PartnerMrApiItem {
  id: string
  referenceId?: string | null
  employeeCode?: string | null
  email?: string | null
  phone?: string | null
  fullName?: string | null
}

interface PartnerDealerItem {
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
  region?: PartnerRegionApiItem | null
  assignedMedicalRepresentativeId?: string | null
  assignedMedicalRepresentative?: PartnerMrApiItem | null
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
  businesses?: PartnerDealerItem['business'],
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

function mapBusinessDocuments(
  outletName: string | null | undefined,
  documents: PartnerDocumentApiItem[] | undefined,
): LicenseDocument[] {
  return (documents ?? []).map((doc) => ({
    id: doc.id,
    documentName: doc.name,
    uploadDate: '-',
    verificationStatus: 'pending' as const,
    expiryDate: '-',
    fileUrl: doc.path,
  }))
}

function mapPartnerBusinesses(
  business: PartnerDealerItem['business'],
): PartnerBusinessDetail[] {
  if (!business) return []
  return business.map((b) => ({
    id: b.id,
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
    pincode: b.pincode ?? undefined,
    latitude: b.latitude ?? undefined,
    longitude: b.longitude ?? undefined,
    scanRadius: b.scanRadius ?? undefined,
    bufferRadius: b.bufferRadius ?? undefined,
    geoAccuracy: b.geoAccuracy ?? undefined,
    regionId: b.regionId ?? undefined,
    notes: b.notes ?? undefined,
    documents: mapBusinessDocuments(b.outletName, b.documents),
  }))
}

function mapPartnerDealer(item: PartnerDealerItem): Dealer {
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

  const geoLock = {
    active: Boolean(business?.latitude && business?.longitude),
    latitude: business?.latitude ?? 0,
    longitude: business?.longitude ?? 0,
    allowedRadiusMeters: 100,
    lastVerifiedDate: '-',
    bufferRadiusMeters: 10,
  }

  return {
    id: item.id,
    referenceId: item.referenceId ?? undefined,
    shopName: item.businessName ?? business?.outletName ?? ownerName,
    ownerName,
    email: item.email ?? '-',
    phone: item.phone ?? '-',
    city: business?.city ?? '-',
    zone: inferZone(business?.state),
    status: mapStatus(item.status, item.isBlocked),
    approvalStatus: item.approvalStatus ?? undefined,
    profileImageUrl: item.profileImage?.path ?? undefined,
    licenseNumber: item.gstNumber ?? business?.drugLicenseNumber ?? '-',
    panNumber: business?.panNumber ?? undefined,
    drugLicenseNumber: business?.drugLicenseNumber ?? undefined,
    drugLicenseExpiry: business?.drugLicenseExpiry ?? undefined,
    regionId: item.regionId ?? item.region?.id ?? undefined,
    regionName: item.region?.name ?? undefined,
    onboardedBy: mapOnboardedBy(business?.onboardedByType),
    availablePoints: 0,
    assignedMr:
      item.assignedMedicalRepresentative?.fullName ??
      item.assignedMedicalRepresentativeId ??
      '-',
    assignedMrId:
      item.assignedMedicalRepresentative?.id ??
      item.assignedMedicalRepresentativeId ??
      undefined,
    assignedMrName: item.assignedMedicalRepresentative?.fullName ?? undefined,
    assignedMrCode: item.assignedMedicalRepresentative?.employeeCode ?? undefined,
    assignedMrPhone: item.assignedMedicalRepresentative?.phone ?? undefined,
    assignedMrEmail: item.assignedMedicalRepresentative?.email ?? undefined,
    notes: item.notes ?? undefined,
    registeredAddress: address || '-',
    totalScans: 0,
    totalRedemptions: 0,
    scanHistory: [],
    PointsHistory: [],
    interestedProducts: [],
    documents: mapPartnerDocuments(item.business),
    businesses: mapPartnerBusinesses(item.business),
    geoLock,
    activeOrders: 0,
    liveDeliveries: false,
    godowns: business
      ? [
          {
            id: business.id,
            name: business.outletName ?? 'Godown',
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
): DealerKpis {
  const data = response.data
  return {
    totalDealers: data.totalPartners,
    activeDealers: data.activePartners,
    inactiveDealers: data.inactivePartners,
    pendingApproval: data.pendingApprovalPartners,
  }
}

const dealerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDealers: builder.query<
      { items: Dealer[]; totalItems: number },
      DealerQueryParams | void
    >({
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
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () =>
          mockDelay({ items: mockDealers, totalItems: mockDealers.length }),
      }),
      transformResponse: (
        response: PartnerListApiResponse | { items: Dealer[]; totalItems: number },
      ) =>
        'success' in response
          ? {
              items: response.data.items.map(mapPartnerDealer),
              totalItems: response.data.totalItems,
            }
          : response,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Partners' as const, id })),
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
      transformResponse: (
        response: PartnerDetailApiResponse | Dealer | undefined,
      ) =>
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

    getDealerAnalytics: builder.query<
      DealerKpis,
      AnalyticsDateParams & { regionId?: string }
    >({
      query: (params) => ({
        tag: 'Partners',
        url: '/analytics-cards/partners/DEALER',
        params: {
          preset: params.preset,
          startDate: params.startDate,
          endDate: params.endDate,
          regionId: params.regionId || undefined,
        },
        mockResolver: () => mockDelay(dealerKpis),
      }),
      transformResponse: (
        response: PartnerAnalyticsApiResponse | DealerKpis,
      ) => ('data' in response ? mapPartnerAnalytics(response) : response),
      providesTags: [{ type: 'Partners', id: 'DEALER_ANALYTICS' }],
    }),

    activateDealer: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Partners',
        url: `/partners/${id}/activate`,
        method: 'PATCH',
        mockResolver: () => Promise.resolve(),
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const detailPatch = dispatch(
          dealerApi.util.updateQueryData('getDealerDetail', id, (draft) => {
            if (draft) {
              draft.status = 'active'
            }
          }),
        )

        const listPatch = dispatch(
          dealerApi.util.updateQueryData('getDealers', undefined, (draft) => {
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
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const detailPatch = dispatch(
          dealerApi.util.updateQueryData('getDealerDetail', id, (draft) => {
            if (draft) {
              draft.status = 'inactive'
            }
          }),
        )

        const listPatch = dispatch(
          dealerApi.util.updateQueryData('getDealers', undefined, (draft) => {
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

    updateDealer: builder.mutation<
      void,
      { id: string; payload: DealerApiPayload }
    >({
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

    /** Partial update — only the geo fence fields on the dealer's business record. */
    updateDealerGeoFence: builder.mutation<
      void,
      { id: string; businessId: string; scanRadius: number; bufferRadius: number }
    >({
      query: ({ id, businessId, scanRadius, bufferRadius }) => ({
        tag: 'Partners',
        url: `/partners/${id}`,
        method: 'PATCH',
        data: { businesses: [{ id: businessId, scanRadius, bufferRadius }] },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Partners', id },
        { type: 'Partners', id: 'LIST' },
        { type: 'GeoFences', id: 'LIST' },
        { type: 'GeoFences', id: 'ANALYTICS_CARDS' },
      ],
    }),

    deleteDealer: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Partners',
        url: `/partners/${id}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Partners', id },
        { type: 'Partners', id: 'LIST' },
        { type: 'Partners', id: 'KPIS' },
      ],
    }),

    deleteDealerBusiness: builder.mutation<
      void,
      { id: string; businessId: string }
    >({
      query: ({ id, businessId }) => ({
        tag: 'Partners',
        url: `/partners/${id}/business/${businessId}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Partners', id },
      ],
    }),
  }),
})

export const {
  useGetDealersQuery,
  useGetDealerDetailQuery,
  useGetDealerKpisQuery,
  useGetDealerAnalyticsQuery,
  useActivateDealerMutation,
  useDeactivateDealerMutation,
  useCreateDealerMutation,
  useUpdateDealerMutation,
  useUpdateDealerGeoFenceMutation,
  useDeleteDealerMutation,
  useDeleteDealerBusinessMutation,
} = dealerApi
