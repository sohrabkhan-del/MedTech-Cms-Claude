import { baseApi } from '@/store/api/baseApi'
import { mockDelay } from '@/services/mockDelay'

export type GeoFencePartnerType = 'CHEMIST' | 'DEALER'

export interface GeoFenceSetting {
  id: string
  partnerType: GeoFencePartnerType
  radius: number
  bufferDistance: number
  createdBy: string
  updatedBy: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface GeoFenceSettingPayload {
  radius: number
  bufferDistance: number
}

interface GeoFenceSettingsListApiResponse {
  success: boolean
  message?: string
  data: GeoFenceSetting[]
}

const mockSettings: GeoFenceSetting[] = [
  {
    id: 'setting-dealer',
    partnerType: 'DEALER',
    radius: 150,
    bufferDistance: 50,
    createdBy: 'System',
    updatedBy: 'System',
    isDeleted: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'setting-chemist',
    partnerType: 'CHEMIST',
    radius: 100,
    bufferDistance: 40,
    createdBy: 'System',
    updatedBy: 'System',
    isDeleted: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

const geoFenceSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGeoFenceSettings: builder.query<GeoFenceSetting[], void>({
      query: () => ({
        tag: 'GeoFenceSettings',
        url: '/geo-fence-settings',
        mockResolver: () => mockDelay(mockSettings),
      }),
      transformResponse: (response: GeoFenceSettingsListApiResponse | GeoFenceSetting[]) =>
        Array.isArray(response) ? response : response.data,
      providesTags: [{ type: 'GeoFenceSettings', id: 'SETTINGS' }],
    }),

    updateGeoFenceSettingByPartnerType: builder.mutation<
      void,
      { partnerType: GeoFencePartnerType; payload: GeoFenceSettingPayload }
    >({
      query: ({ partnerType, payload }) => ({
        tag: 'GeoFenceSettings',
        url: `/geo-fence-settings/${partnerType}`,
        method: 'PATCH',
        data: payload,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [{ type: 'GeoFenceSettings', id: 'SETTINGS' }],
    }),
  }),
})

export const {
  useGetGeoFenceSettingsQuery,
  useUpdateGeoFenceSettingByPartnerTypeMutation,
} = geoFenceSettingsApi
