import { baseApi } from '@/store/api/baseApi'
import type {
  AlertSeverity,
  AlertStatus,
  SecurityAlert,
  SecurityAlertDetail,
} from '@/features/fieldOperations/types/fieldOperations.types'
import { mockDelay } from '@/services/mockDelay'

export interface SecurityAlertQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  severity?: string
  type?: string
  partnerId?: string
  affectedPartnerId?: string
  businessId?: string
  productId?: string
  productUploadId?: string
  batch?: string
  regionId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SecurityAlertKpis {
  totalAlerts: number
  totalAlertsChange: number
  highSeverity: number
  mediumSeverity: number
  lowSeverity: number
  criticalSeverity: number
}

interface SecurityAlertKpisApiData {
  totalSecurityAlerts: number
  totalSecurityAlertsChange: number
  highSeverityAlerts: number
  mediumSeverityAlerts: number
  lowSeverityAlerts: number
  criticalSeverityAlerts: number
}

function mapSecurityAlertKpis(
  data: SecurityAlertKpisApiData,
): SecurityAlertKpis {
  return {
    totalAlerts: data.totalSecurityAlerts,
    totalAlertsChange: data.totalSecurityAlertsChange,
    highSeverity: data.highSeverityAlerts,
    mediumSeverity: data.mediumSeverityAlerts,
    lowSeverity: data.lowSeverityAlerts,
    criticalSeverity: data.criticalSeverityAlerts,
  }
}

interface ApiPartnerRef {
  id: string
  referenceId?: string | null
  businessName: string
  ownerName: string
  type: string
  region: string
}

interface ApiSecurityAlertItem {
  id: string
  type: string
  severity: string
  status: string
  reason: string
  scannedCode: string
  packagingLevel: string
  serial: number
  batch: string
  businessDetails: {
    businessName: string
    partnerName: string
    outletName: string
    outletUserName?: string | null
  }
  productDetails: {
    productName: string
    productCode: string
    categoryName?: string | null
  }
  productUpload: {
    uploadBatchId: string
    batchNo: string
    productionPlanNumber: string
  }
  scanPartnerDetails: ApiPartnerRef
  affectedPartnerDetails: ApiPartnerRef
  affectedPartnerRewardPoints: number
  reviewedBy: string | null
  reviewedAt: string | null
  remarks: string | null
  createdAt: string
  updatedAt: string
}

interface ApiSecurityAlertDetailItem extends ApiSecurityAlertItem {
  productId: string
  productUploadId: string
  businessId: string
  technicalInformation: {
    sourceIp: string
    deviceInfo: string
    deviceUuid: string
    appVersion: string
  }
}

interface SecurityAlertListApiResponse {
  success: boolean
  message?: string
  data: {
    items: ApiSecurityAlertItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

interface SecurityAlertDetailApiResponse {
  success: boolean
  message?: string
  data: ApiSecurityAlertDetailItem
}

const severityMap: Record<string, AlertSeverity> = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

const statusMap: Record<string, AlertStatus> = {
  OPEN: 'open',
  REVIEWING: 'reviewing',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
}

function mapPartnerRef(ref: ApiPartnerRef) {
  return {
    id: ref.id,
    referenceId: ref.referenceId ?? undefined,
    businessName: ref.businessName,
    ownerName: ref.ownerName,
    type: ref.type,
    region: ref.region,
  }
}

function mapSecurityAlert(item: ApiSecurityAlertItem): SecurityAlert {
  return {
    id: item.id,
    type: item.type as SecurityAlert['type'],
    severity: severityMap[item.severity] ?? 'low',
    status: statusMap[item.status] ?? 'open',
    reason: item.reason,
    scannedCode: item.scannedCode,
    packagingLevel: item.packagingLevel,
    serial: item.serial,
    batch: item.batch,
    businessDetails: item.businessDetails,
    productDetails: item.productDetails,
    productUpload: item.productUpload,
    scanPartnerDetails: mapPartnerRef(item.scanPartnerDetails),
    affectedPartnerDetails: mapPartnerRef(item.affectedPartnerDetails),
    affectedPartnerRewardPoints: item.affectedPartnerRewardPoints,
    reviewedBy: item.reviewedBy,
    reviewedAt: item.reviewedAt,
    remarks: item.remarks,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function mapSecurityAlertDetail(
  item: ApiSecurityAlertDetailItem,
): SecurityAlertDetail {
  return {
    ...mapSecurityAlert(item),
    productId: item.productId,
    productUploadId: item.productUploadId,
    businessId: item.businessId,
    technicalInformation: item.technicalInformation,
  }
}

const emptyKpis: SecurityAlertKpis = {
  totalAlerts: 0,
  totalAlertsChange: 0,
  highSeverity: 0,
  mediumSeverity: 0,
  lowSeverity: 0,
  criticalSeverity: 0,
}

const securityAlertsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSecurityAlerts: builder.query<
      { items: SecurityAlert[]; totalItems: number },
      SecurityAlertQueryParams | void
    >({
      query: (params) => ({
        tag: 'SecurityAlerts',
        url: '/product-scan-security',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          status: params?.status || undefined,
          severity: params?.severity || undefined,
          type: params?.type || undefined,
          partnerId: params?.partnerId || undefined,
          affectedPartnerId: params?.affectedPartnerId || undefined,
          businessId: params?.businessId || undefined,
          productId: params?.productId || undefined,
          productUploadId: params?.productUploadId || undefined,
          batch: params?.batch || undefined,
          regionId: params?.regionId || undefined,
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder || undefined,
        },
        mockResolver: () => mockDelay({ items: [], totalItems: 0 }),
      }),
      transformResponse: (
        response:
          | SecurityAlertListApiResponse
          | { items: SecurityAlert[]; totalItems: number },
      ) =>
        'success' in response
          ? {
              items: response.data.items.map(mapSecurityAlert),
              totalItems: response.data.totalItems,
            }
          : response,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: 'SecurityAlerts' as const,
                id,
              })),
              { type: 'SecurityAlerts' as const, id: 'LIST' },
            ]
          : [{ type: 'SecurityAlerts' as const, id: 'LIST' }],
    }),

    getSecurityAlertDetail: builder.query<
      SecurityAlertDetail | undefined,
      string
    >({
      query: (id) => ({
        tag: 'SecurityAlerts',
        url: `/product-scan-security/${id}`,
        mockResolver: () => mockDelay(undefined),
      }),
      transformResponse: (
        response:
          SecurityAlertDetailApiResponse | SecurityAlertDetail | undefined,
      ) =>
        response && 'data' in response
          ? mapSecurityAlertDetail(response.data)
          : response,
      providesTags: (_result, _error, id) => [{ type: 'SecurityAlerts', id }],
    }),

    getSecurityAlertKpis: builder.query<SecurityAlertKpis, void>({
      query: () => ({
        tag: 'SecurityAlerts',
        url: '/analytics-cards/product-scan-security',
        mockResolver: () => mockDelay(emptyKpis),
      }),
      transformResponse: (
        response:
          | { success: boolean; data: SecurityAlertKpisApiData }
          | SecurityAlertKpis,
      ) =>
        'data' in response ? mapSecurityAlertKpis(response.data) : response,
      providesTags: [{ type: 'SecurityAlerts', id: 'KPIS' }],
    }),

    getPartnerSecurityHistory: builder.query<
      { items: SecurityAlert[]; totalItems: number },
      { partnerId: string; page?: number; limit?: number; search?: string }
    >({
      query: ({ partnerId, page, limit, search }) => ({
        tag: 'SecurityAlerts',
        url: `/product-scan-security/partner/${partnerId}/history`,
        params: {
          page: page ?? 1,
          limit: limit ?? 10,
          search: search || undefined,
        },
        mockResolver: () => mockDelay({ items: [], totalItems: 0 }),
      }),
      transformResponse: (
        response:
          | SecurityAlertListApiResponse
          | { items: SecurityAlert[]; totalItems: number },
      ) =>
        'success' in response
          ? {
              items: response.data.items.map(mapSecurityAlert),
              totalItems: response.data.totalItems,
            }
          : response,
      providesTags: (_result, _error, { partnerId }) => [
        { type: 'SecurityAlerts', id: `PARTNER_${partnerId}` },
      ],
    }),
  }),
})

export const {
  useGetSecurityAlertsQuery,
  useGetSecurityAlertDetailQuery,
  useGetSecurityAlertKpisQuery,
  useGetPartnerSecurityHistoryQuery,
} = securityAlertsApi
