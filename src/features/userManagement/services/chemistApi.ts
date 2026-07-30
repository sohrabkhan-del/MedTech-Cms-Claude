// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import { mockChemists, chemistKpis, getChemistById } from '@/features/userManagement/mockChemists'
import type { Chemist, ChemistKpis } from '@/features/userManagement/types/userManagement.types'
import { mockDelay } from '@/services/mockDelay'

const chemistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChemists: builder.query<Chemist[], void>({
      query: () => ({ tag: 'Chemists', url: '/chemists', mockResolver: () => mockDelay(mockChemists) }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Chemists' as const, id })), { type: 'Chemists' as const, id: 'LIST' }]
          : [{ type: 'Chemists' as const, id: 'LIST' }],
    }),

    getChemistDetail: builder.query<Chemist | undefined, string>({
      query: (id) => ({
        tag: 'Chemists',
        url: `/chemists/${id}`,
        mockResolver: () => mockDelay(getChemistById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'Chemists', id }],
    }),

    getChemistKpis: builder.query<ChemistKpis, void>({
      query: () => ({ tag: 'Chemists', url: '/chemists/kpis', mockResolver: () => mockDelay(chemistKpis) }),
      providesTags: [{ type: 'Chemists', id: 'KPIS' }],
    }),
  }),
})

export const { useGetChemistsQuery, useGetChemistDetailQuery, useGetChemistKpisQuery } = chemistApi
