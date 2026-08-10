import { baseApi } from '@/store/api/baseApi'
import {
  mockApprovalRequests,
  getApprovalRequestById,
  approvalRequestKpis,
  rejectedRequestKpis,
} from '@/features/userManagement/mockApprovalRequests'
import type {
  ApprovalRequest,
  ApprovalStatus,
  RequestType,
  RequestDocument,
  RequestBusiness,
  RequestRegion,
  RequestAssignedMr,
} from '@/types/approvalRequest'
import type { PartnerZone } from '@/types/partner'
import { mockDelay } from '@/services/mockDelay'
import type { AnalyticsDateParams } from '@/utils/dateRangeToAnalyticsParams'

export interface VerificationQueryParams {
  page?: number
  limit?: number
  search?: string
  regionId?: string
  type?: RequestType
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  preset?: string
  startDate?: string
  endDate?: string
}

interface PartnerDocumentApiItem {
  id: string
  name: string
  size?: number
  path: string
  type?: string
}

interface PartnerBusinessApiItem {
  id: string
  outletName?: string | null
  approvalStatus?: string | null
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
  country?: string | null
  pincode?: string | null
  latitude?: number | null
  longitude?: number | null
  geoAccuracy?: number | null
  scanRadius?: number | null
  bufferRadius?: number | null
  documents?: PartnerDocumentApiItem[]
  regionId?: string | null
  notes?: string | null
  onboardedByType?: string | null
  onboardedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

interface PartnerRegionApiItem {
  id: string
  code?: string | null
  name?: string | null
  isActive?: boolean
}

interface PartnerAssignedMrApiItem {
  id: string
  referenceId?: string | null
  employeeCode?: string | null
  email?: string | null
  phone?: string | null
  fullName?: string | null
  status?: string | null
}

interface PartnerVerificationApiItem {
  id: string
  referenceId?: string | null
  type?: 'DEALER' | 'CHEMIST' | null
  businessName?: string | null
  ownerName?: string | null
  gstNumber?: string | null
  regionId?: string | null
  region?: PartnerRegionApiItem | null
  assignedMedicalRepresentativeId?: string | null
  assignedMedicalRepresentative?: PartnerAssignedMrApiItem | null
  notes?: string | null
  email?: string | null
  phone?: string | null
  country?: string | null
  status?: string | null
  approvalStatus?: string | null
  approvalReason?: string | null
  isBlocked?: boolean
  createdAt?: string | null
  updatedAt?: string | null
  business?: PartnerBusinessApiItem[]
}

interface PartnerListApiResponse {
  success: boolean
  data: {
    items: PartnerVerificationApiItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

interface PartnerDetailApiResponse {
  success: boolean
  data: PartnerVerificationApiItem
}

function mapRequestType(type?: string | null): RequestType {
  return type === 'CHEMIST' ? 'Chemist' : 'Dealer'
}

function mapApprovalStatus(status?: string | null): ApprovalStatus {
  if (status === 'APPROVED') return 'approved'
  if (status === 'REJECTED') return 'rejected'
  return 'pending'
}

function inferZone(state?: string | null): PartnerZone {
  const normalized = state?.toLowerCase() ?? ''
  if (['delhi', 'haryana', 'punjab', 'uttar pradesh'].some((s) => normalized.includes(s))) {
    return 'North'
  }
  if (['tamil', 'kerala', 'karnataka', 'telangana', 'andhra'].some((s) => normalized.includes(s))) {
    return 'South'
  }
  if (['west bengal', 'odisha', 'bihar', 'assam'].some((s) => normalized.includes(s))) {
    return 'East'
  }
  return 'West'
}

function formatDate(value?: string | null): string {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function mapDocuments(businesses?: PartnerBusinessApiItem[]): RequestDocument[] {
  if (!businesses) return []
  return businesses.flatMap((b) =>
    (b.documents ?? []).map((doc) => ({
      id: doc.id,
      documentName:
        businesses.length > 1 && b.outletName ? `${b.outletName} · ${doc.name}` : doc.name,
      uploadDate: '-',
      verificationStatus: 'pending' as const,
    })),
  )
}

function mapBusinesses(businesses?: PartnerBusinessApiItem[]): RequestBusiness[] {
  if (!businesses) return []
  return businesses.map((b) => ({
    id: b.id,
    outletName: b.outletName ?? 'Outlet',
    addressType: b.addressType ?? '-',
    address:
      [
        b.addressLine1,
        b.addressLine2,
        b.landmark,
        b.city,
        b.district,
        b.state,
        b.pincode,
      ]
        .filter(Boolean)
        .join(', ') || '-',
    drugLicenseNumber: b.drugLicenseNumber ?? '-',
    panNumber: b.panNumber ?? '-',
    documents: (b.documents ?? []).map((doc) => ({
      id: doc.id,
      documentName: doc.name,
      uploadDate: '-',
      verificationStatus: 'pending' as const,
    })),
  }))
}

function mapRegion(region?: PartnerRegionApiItem | null): RequestRegion | undefined {
  if (!region) return undefined
  return {
    id: region.id,
    code: region.code ?? '-',
    name: region.name ?? '-',
    isActive: region.isActive ?? false,
  }
}

function mapAssignedMr(mr?: PartnerAssignedMrApiItem | null): RequestAssignedMr | undefined {
  if (!mr) return undefined
  return {
    id: mr.id,
    referenceId: mr.referenceId ?? '-',
    employeeCode: mr.employeeCode ?? '-',
    fullName: mr.fullName ?? 'Unassigned',
    email: mr.email ?? '-',
    phone: mr.phone ?? '-',
    status: mr.status ?? '-',
  }
}

function mapPartnerToApprovalRequest(item: PartnerVerificationApiItem): ApprovalRequest {
  const business = item.business?.[0]
  const ownerName =
    item.ownerName?.trim() ||
    business?.outletName?.trim() ||
    item.assignedMedicalRepresentative?.fullName?.trim() ||
    'Unknown'
  const status = mapApprovalStatus(item.approvalStatus)
  const zone = item.region?.name
    ? (item.region.name as PartnerZone)
    : inferZone(business?.state)
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
    applicantName: ownerName,
    requestType: mapRequestType(item.type),
    status,
    city: business?.city ?? '-',
    region: zone,
    regionDetail: mapRegion(item.region),
    assignedMr: mapAssignedMr(item.assignedMedicalRepresentative),
    submittedDate: formatDate(item.createdAt),
    registeredBy: 'Self',
    onboardedType: business?.onboardedByType === 'MR' ? 'MR' : 'Self',
    onboardedBy: ownerName,

    storeName: item.businessName ?? business?.outletName ?? ownerName,
    ownerName,
    email: item.email ?? '-',
    mobileNumber: item.phone ?? '-',
    completeAddress: address || '-',

    drugLicenseNumber: business?.drugLicenseNumber ?? '-',
    gstNumber: item.gstNumber ?? undefined,
    businessCategory: business?.addressType ?? '-',

    latitude: business?.latitude ?? 0,
    longitude: business?.longitude ?? 0,
    assignedZone: zone,
    geoVerificationStatus:
      business?.latitude && business?.longitude ? 'verified' : 'unverified',

    documents: mapDocuments(item.business),
    businesses: mapBusinesses(item.business),

    requestCreatedDate: formatDate(item.createdAt),
    submittedBy: ownerName,
    lastUpdated: formatDate(item.updatedAt),
    reviewedBy: status !== 'pending' ? ownerName : undefined,
    decisionDate: status !== 'pending' ? formatDate(item.updatedAt) : undefined,
    remarks: status === 'approved' ? item.approvalReason ?? undefined : undefined,
    rejectionReason: status === 'rejected' ? item.approvalReason ?? undefined : undefined,

    timeline: [
      { id: `${item.id}-tl-0`, activity: 'Request Submitted', dateTime: formatDate(item.createdAt) },
      ...(status === 'approved'
        ? [{ id: `${item.id}-tl-1`, activity: 'Approved' as const, dateTime: formatDate(item.updatedAt) }]
        : status === 'rejected'
          ? [{ id: `${item.id}-tl-1`, activity: 'Rejected' as const, dateTime: formatDate(item.updatedAt) }]
          : []),
    ],
    auditHistory: [
      {
        id: `${item.id}-audit-0`,
        date: formatDate(item.createdAt),
        action: 'Request Created',
        performedBy: 'System',
        remarks: 'Onboarding request submitted.',
      },
      ...(status !== 'pending'
        ? [
            {
              id: `${item.id}-audit-1`,
              date: formatDate(item.updatedAt),
              action: status === 'approved' ? 'Request Approved' : 'Request Rejected',
              performedBy: ownerName,
              remarks: item.approvalReason || (status === 'approved' ? 'Approved.' : 'Rejected.'),
            },
          ]
        : []),
    ],
  }
}

function mapApprovalStatusParam(status?: ApprovalStatus) {
  if (status === 'approved') return 'APPROVED'
  if (status === 'rejected') return 'REJECTED'
  if (status === 'pending') return 'PENDING_APPROVAL'
  return undefined
}

function mapTypeParam(type?: RequestType) {
  if (type === 'Chemist') return 'CHEMIST'
  if (type === 'Dealer') return 'DEALER'
  return undefined
}

const verificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApprovalRequests: builder.query<
      { items: ApprovalRequest[]; totalItems: number },
      (VerificationQueryParams & { status?: ApprovalStatus }) | ApprovalStatus | void
    >({
      query: (arg) => {
        const params: VerificationQueryParams & { status?: ApprovalStatus } =
          typeof arg === 'string' ? { status: arg } : (arg ?? {})
        return {
          tag: 'Verification',
          url: '/partners',
          params: {
            page: params.page ?? 1,
            limit: params.limit ?? 10,
            search: params.search || undefined,
            regionId: params.regionId || undefined,
            type: mapTypeParam(params.type),
            approvalStatus: mapApprovalStatusParam(params.status),
            sortBy: params.sortBy || 'createdAt',
            sortOrder: params.sortOrder ?? 'desc',
            preset: params.preset || undefined,
            startDate: params.startDate || undefined,
            endDate: params.endDate || undefined,
          },
          mockResolver: () => {
            const filtered = params.status
              ? mockApprovalRequests.filter((r) => r.status === params.status)
              : mockApprovalRequests
            return mockDelay({ items: filtered, totalItems: filtered.length })
          },
        }
      },
      transformResponse: (
        response:
          | PartnerListApiResponse
          | { items: ApprovalRequest[]; totalItems: number },
      ) =>
        'success' in response
          ? {
              items: response.data.items.map(mapPartnerToApprovalRequest),
              totalItems: response.data.totalItems,
            }
          : response,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Verification' as const, id })),
              { type: 'Verification' as const, id: 'LIST' },
            ]
          : [{ type: 'Verification' as const, id: 'LIST' }],
    }),

    getApprovalRequestDetail: builder.query<ApprovalRequest | undefined, string>({
      query: (id) => ({
        tag: 'Verification',
        url: `/partners/${id}`,
        mockResolver: () => mockDelay(getApprovalRequestById(id)),
      }),
      transformResponse: (
        response: PartnerDetailApiResponse | ApprovalRequest | undefined,
      ) =>
        response && 'data' in response
          ? mapPartnerToApprovalRequest(response.data)
          : response,
      providesTags: (_result, _error, id) => [{ type: 'Verification', id }],
    }),

    getApprovalRequestAnalytics: builder.query<
      { pending: number; approved: number; rejected: number; total: number },
      AnalyticsDateParams & { regionId?: string }
    >({
      query: (params) => ({
        tag: 'Verification',
        url: '/analytics-cards/partner-business-requests/approval',
        params: {
          preset: params.preset,
          startDate: params.startDate,
          endDate: params.endDate,
          regionId: params.regionId || undefined,
        },
        mockResolver: () => mockDelay(approvalRequestKpis),
      }),
      transformResponse: (
        response:
          | {
              success: boolean
              data: {
                totalRequests: number
                chemistRequests: number
                dealerRequests: number
                pendingRequests: number
                approvedRequests: number
                rejectedRequests: number
              }
            }
          | typeof approvalRequestKpis,
      ) =>
        'data' in response
          ? {
              pending: response.data.pendingRequests,
              approved: response.data.approvedRequests,
              rejected: response.data.rejectedRequests,
              total: response.data.totalRequests,
            }
          : response,
      providesTags: [{ type: 'Verification', id: 'KPIS' }],
    }),

    getRejectedRequestKpis: builder.query<
      { totalRejected: number; dealerRejections: number; chemistRejections: number },
      void
    >({
      query: () => ({
        tag: 'Verification',
        url: '/analytics-cards/partner-business-requests/rejected',
        mockResolver: () =>
          mockDelay({
            totalRejected: rejectedRequestKpis.totalRejected,
            dealerRejections: rejectedRequestKpis.dealerRejections,
            chemistRejections: rejectedRequestKpis.chemistRejections,
          }),
      }),
      transformResponse: (
        response:
          | {
              success: boolean
              data: {
                totalRejectedRequests: number
                chemistRequests: number
                dealerRequests: number
              }
            }
          | { totalRejected: number; dealerRejections: number; chemistRejections: number },
      ) =>
        'data' in response
          ? {
              totalRejected: response.data.totalRejectedRequests,
              dealerRejections: response.data.dealerRequests,
              chemistRejections: response.data.chemistRequests,
            }
          : response,
      providesTags: [{ type: 'Verification', id: 'REJECTED_KPIS' }],
    }),

    decideApprovalRequest: builder.mutation<
      void,
      { id: string; decision: 'approve' | 'reject'; remarks?: string }
    >({
      query: ({ id, decision, remarks }) => ({
        tag: 'Verification',
        url: `/partners/${id}/${decision}`,
        method: 'PATCH',
        data: { reason: remarks },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Verification', id },
        { type: 'Verification', id: 'LIST' },
        { type: 'Verification', id: 'KPIS' },
        { type: 'Verification', id: 'REJECTED_KPIS' },
      ],
    }),

    reopenRequest: builder.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        tag: 'Verification',
        url: `/partners/${id}/reopen`,
        method: 'PATCH',
        data: { reason },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Verification', id },
        { type: 'Verification', id: 'LIST' },
        { type: 'Verification', id: 'KPIS' },
        { type: 'Verification', id: 'REJECTED_KPIS' },
      ],
    }),

    deleteRequest: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Verification',
        url: `/partners/${id}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Verification', id },
        { type: 'Verification', id: 'LIST' },
        { type: 'Verification', id: 'KPIS' },
        { type: 'Verification', id: 'REJECTED_KPIS' },
      ],
    }),

    updateDocument: builder.mutation<void, { requestId: string; documentId: string; file: File }>({
      query: ({ requestId, documentId, file }) => ({
        tag: 'Verification',
        url: `/verification/requests/${requestId}/documents/${documentId}`,
        method: 'PUT',
        data: file,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { requestId }) => [{ type: 'Verification', id: requestId }],
    }),
  }),
})

export const {
  useGetApprovalRequestsQuery,
  useGetApprovalRequestDetailQuery,
  useGetApprovalRequestAnalyticsQuery,
  useGetRejectedRequestKpisQuery,
  useDecideApprovalRequestMutation,
  useReopenRequestMutation,
  useDeleteRequestMutation,
  useUpdateDocumentMutation,
} = verificationApi
