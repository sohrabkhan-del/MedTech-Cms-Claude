// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import { mockGeoFences, getGeoFenceById, geoFenceUserOptions, geoFenceKpis } from '@/features/fieldOperations/mocks/mockGeoFences'
import type { GeoFence, GeoFenceFormValues } from '@/features/fieldOperations/types/fieldOperations.types'
import { mockDelay } from '@/services/mockDelay'

export type GeoFenceUserOption = (typeof geoFenceUserOptions)[number]
export type GeoFenceKpis = typeof geoFenceKpis

// create/update/setStatus/deleteGeoFence are currently no-ops resolving
// immediately so the UI/hook contract is stable ahead of the real API.

const geoFencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGeoFences: builder.query<GeoFence[], void>({
      query: () => ({ tag: 'GeoFences', url: '/geo-fences', mockResolver: () => mockDelay(mockGeoFences) }),
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

    getGeoFenceKpis: builder.query<GeoFenceKpis, void>({
      query: () => ({ tag: 'GeoFences', url: '/geo-fences/kpis', mockResolver: () => mockDelay(geoFenceKpis) }),
      providesTags: [{ type: 'GeoFences', id: 'KPIS' }],
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
      invalidatesTags: [{ type: 'GeoFences', id: 'LIST' }, { type: 'GeoFences', id: 'KPIS' }],
    }),

    updateGeoFence: builder.mutation<void, { id: string; values: GeoFenceFormValues }>({
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
        { type: 'GeoFences', id: 'KPIS' },
      ],
    }),

    setGeoFenceStatus: builder.mutation<void, { id: string; status: 'active' | 'inactive' }>({
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
        { type: 'GeoFences', id: 'KPIS' },
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
        { type: 'GeoFences', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetGeoFencesQuery,
  useGetGeoFenceDetailQuery,
  useGetGeoFenceKpisQuery,
  useGetGeoFenceUserOptionsQuery,
  useCreateGeoFenceMutation,
  useUpdateGeoFenceMutation,
  useSetGeoFenceStatusMutation,
  useDeleteGeoFenceMutation,
} = geoFencesApi
