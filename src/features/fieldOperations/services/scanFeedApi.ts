import { baseApi } from '@/store/api/baseApi'
import type { ScanEvent, ScanEventDetail, ScanStatus } from '@/types/scanFeed'
import { mockDelay } from '@/services/mockDelay'

export interface ScanFeedQueryParams {
  page?: number
  limit?: number
  search?: string
  partnerId?: string
  affectedPartnerId?: string
  businessId?: string
  productId?: string
  productUploadId?: string
  batch?: string
  regionId?: string
  scanStatus?: string
  scanResultType?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ScanFeedByBatchQueryParams {
  /** The upload batch id — path param for /product-scan/batch/:uploadBatchId. */
  uploadBatchId: string
  page?: number
  limit?: number
  search?: string
  /** Filters by partner type, e.g. 'DEALER' | 'CHEMIST'. Omit for all. */
  partnerType?: string
}

interface ApiScanEventItem {
  id: string
  referenceId: string
  businessDetails: {
    businessName: string
    partnerName: string
    outletName: string
    outletUserName?: string | null
  }
  partnerType: string
  scannedAt: string
  scanResult: string
  scanResultType: string
  scanStatus: string
  scannedCode: string
  productDetails: {
    productCode: string
    productCategory?: string | null
  }
  region: string
  batchNo: string
  rewardPointsEarned: number
}

interface ApiScanEventDetailItem extends ApiScanEventItem {
  latitude: number
  longitude: number
  geofenceAllowed: number
  bufferGeofenceAllowed: number
  distanceFromTaggedLocation: number
  technicalInformation: {
    sourceIp: string
    deviceInfo: string
    deviceUuid: string
    scanTimestamp: string
    appVersion: string
  }
  rewardReason?: string | null
  productId: string
  productUploadId: string
  partnerId: string
  businessId: string
  createdAt: string
  updatedAt: string
}

interface ScanFeedListApiResponse {
  success: boolean
  message?: string
  data: {
    items: ApiScanEventItem[]
    totalItems: number
    uploadBatchFileName?: string
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

interface ScanEventDetailApiResponse {
  success: boolean
  message?: string
  data: ApiScanEventDetailItem
}

const statusMap: Record<string, ScanStatus> = {
  SUCCESS: 'success',
  FAILED: 'failed',
}

function mapScanEvent(item: ApiScanEventItem): ScanEvent {
  return {
    id: item.id,
    referenceId: item.referenceId,
    businessDetails: item.businessDetails,
    partnerType: item.partnerType,
    scannedAt: item.scannedAt,
    scanResult: item.scanResult,
    scanResultType: item.scanResultType,
    scanStatus: statusMap[item.scanStatus] ?? 'failed',
    scannedCode: item.scannedCode,
    productDetails: item.productDetails,
    region: item.region,
    batchNo: item.batchNo,
    rewardPointsEarned: item.rewardPointsEarned,
  }
}

function mapScanEventDetail(item: ApiScanEventDetailItem): ScanEventDetail {
  return {
    ...mapScanEvent(item),
    latitude: item.latitude,
    longitude: item.longitude,
    geofenceAllowed: item.geofenceAllowed,
    bufferGeofenceAllowed: item.bufferGeofenceAllowed,
    distanceFromTaggedLocation: item.distanceFromTaggedLocation,
    technicalInformation: item.technicalInformation,
    rewardReason: item.rewardReason,
    productId: item.productId,
    productUploadId: item.productUploadId,
    partnerId: item.partnerId,
    businessId: item.businessId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

const scanFeedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getScanEvents: builder.query<
      { items: ScanEvent[]; totalItems: number; uploadBatchFileName?: string },
      ScanFeedQueryParams | void
    >({
      query: (params) => ({
        tag: 'ScanFeed',
        url: '/product-scan',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          partnerId: params?.partnerId || undefined,
          affectedPartnerId: params?.affectedPartnerId || undefined,
          businessId: params?.businessId || undefined,
          productId: params?.productId || undefined,
          productUploadId: params?.productUploadId || undefined,
          batch: params?.batch || undefined,
          regionId: params?.regionId || undefined,
          scanStatus: params?.scanStatus || undefined,
          scanResultType: params?.scanResultType || undefined,
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder || undefined,
        },
        mockResolver: () =>
          mockDelay({
            items: [],
            totalItems: 0,
            uploadBatchFileName: undefined,
          }),
      }),
      transformResponse: (
        response:
          | ScanFeedListApiResponse
          | {
              items: ScanEvent[]
              totalItems: number
              uploadBatchFileName?: string
            },
      ) =>
        'success' in response
          ? {
              items: response.data.items.map(mapScanEvent),
              totalItems: response.data.totalItems,
              uploadBatchFileName: response.data.uploadBatchFileName,
            }
          : response,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: 'ScanFeed' as const,
                id,
              })),
              { type: 'ScanFeed' as const, id: 'LIST' },
            ]
          : [{ type: 'ScanFeed' as const, id: 'LIST' }],
    }),

    getScanEventDetail: builder.query<ScanEventDetail | undefined, string>({
      query: (id) => ({
        tag: 'ScanFeed',
        url: `/product-scan/${id}`,
        mockResolver: () => mockDelay(undefined),
      }),
      transformResponse: (
        response: ScanEventDetailApiResponse | ScanEventDetail | undefined,
      ) =>
        response && 'data' in response
          ? mapScanEventDetail(response.data)
          : response,
      providesTags: (_result, _error, id) => [{ type: 'ScanFeed', id }],
    }),

    getScanEventsByBatch: builder.query<
      { items: ScanEvent[]; totalItems: number; uploadBatchFileName?: string },
      ScanFeedByBatchQueryParams
    >({
      query: ({ uploadBatchId, ...params }) => ({
        tag: 'ScanFeed',
        url: `/product-scan/batch/${uploadBatchId}`,
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          search: params.search || undefined,
          partnerType: params.partnerType || undefined,
        },
        mockResolver: () =>
          mockDelay({
            items: [],  
            totalItems: 0,
            uploadBatchFileName: undefined,
          }),
      }),
      transformResponse: (
        response:
          | ScanFeedListApiResponse
          | {
              items: ScanEvent[]
              totalItems: number
              uploadBatchFileName?: string
            },
      ) =>
        'success' in response
          ? {
              items: response.data.items.map(mapScanEvent),
              totalItems: response.data.totalItems,
              uploadBatchFileName: response.data.uploadBatchFileName,
            }
          : response,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: 'ScanFeed' as const,
                id,
              })),
              { type: 'ScanFeed' as const, id: 'LIST' },
            ]
          : [{ type: 'ScanFeed' as const, id: 'LIST' }],
    }),
  }),
})

export const {
  useGetScanEventsQuery,
  useGetScanEventDetailQuery,
  useGetScanEventsByBatchQuery,
} = scanFeedApi
