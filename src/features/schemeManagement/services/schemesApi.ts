// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockSchemes,
  mockGeneralSchemes,
  mockSeasonalSchemes,
  getSchemeById,
  setSchemeStatus,
  allSchemeKpis,
  generalSchemeKpis,
  seasonalSchemeKpis,
  schemeRegionOptions,
  schemePartnerTypeOptions,
} from '@/features/schemeManagement/mockSchemes'
import { mockGifts } from '@/features/schemeManagement/mockGifts'
import { mockProducts } from '@/features/inventoryManagement/mockProducts'
import type {
  Scheme,
  SchemeFormValues,
  SchemeStatus,
  SchemePartnerType,
} from '@/features/schemeManagement/types/schemeManagement.types'
import { mockDelay } from '@/services/mockDelay'
import type { PartnerZone } from '@/types/partner'

export interface SchemeGiftProductOption {
  id: string
  name: string
  image: string
  price: number
  dealerBasePoints: number | null
  chemistBasePoints: number | null
}

export interface SchemeMasterProductOption {
  id: string
  name: string
  code: string
  category: string
  dealerRewardPoints: number
  chemistRewardPoints: number
}

export interface SchemeFormOptions {
  regionOptions: PartnerZone[]
  partnerTypeOptions: SchemePartnerType[]
  giftProductOptions: SchemeGiftProductOption[]
  masterProductOptions: SchemeMasterProductOption[]
}

// create/update/deleteScheme are currently no-ops resolving immediately so
// the UI/hook contract is stable ahead of the real API. updateScheme keeps
// the mock status-mutation side effect that setSchemeStatus performed.

function isNameTaken(name: string, excludeId?: string): boolean {
  const normalized = name.trim().toLowerCase()
  return [...mockGeneralSchemes, ...mockSeasonalSchemes].some(
    (scheme) => scheme.id !== excludeId && scheme.name.trim().toLowerCase() === normalized,
  )
}

const schemesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSchemes: builder.query<Scheme[], void>({
      query: () => ({ tag: 'Schemes', url: '/schemes', mockResolver: () => mockDelay(mockSchemes) }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Schemes' as const, id })), { type: 'Schemes' as const, id: 'LIST' }]
          : [{ type: 'Schemes' as const, id: 'LIST' }],
    }),

    getGeneralSchemes: builder.query<Scheme[], void>({
      query: () => ({
        tag: 'Schemes',
        url: '/schemes/general',
        mockResolver: () => mockDelay(mockGeneralSchemes),
      }),
      providesTags: [{ type: 'Schemes', id: 'GENERAL_LIST' }],
    }),

    getSeasonalSchemes: builder.query<Scheme[], void>({
      query: () => ({
        tag: 'Schemes',
        url: '/schemes/seasonal',
        mockResolver: () => mockDelay(mockSeasonalSchemes),
      }),
      providesTags: [{ type: 'Schemes', id: 'SEASONAL_LIST' }],
    }),

    getSchemeDetail: builder.query<Scheme | undefined, string>({
      query: (id) => ({
        tag: 'Schemes',
        url: `/schemes/${id}`,
        mockResolver: () => mockDelay(getSchemeById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'Schemes', id }],
    }),

    getAllSchemeKpis: builder.query<typeof allSchemeKpis, void>({
      query: () => ({ tag: 'Schemes', url: '/schemes/kpis', mockResolver: () => mockDelay(allSchemeKpis) }),
      providesTags: [{ type: 'Schemes', id: 'KPIS' }],
    }),

    getGeneralSchemeKpis: builder.query<typeof generalSchemeKpis, void>({
      query: () => ({
        tag: 'Schemes',
        url: '/schemes/general/kpis',
        mockResolver: () => mockDelay(generalSchemeKpis),
      }),
      providesTags: [{ type: 'Schemes', id: 'GENERAL_KPIS' }],
    }),

    getSeasonalSchemeKpis: builder.query<typeof seasonalSchemeKpis, void>({
      query: () => ({
        tag: 'Schemes',
        url: '/schemes/seasonal/kpis',
        mockResolver: () => mockDelay(seasonalSchemeKpis),
      }),
      providesTags: [{ type: 'Schemes', id: 'SEASONAL_KPIS' }],
    }),

    getSchemeFormOptions: builder.query<SchemeFormOptions, void>({
      query: () => ({
        tag: 'Schemes',
        url: '/schemes/form-options',
        mockResolver: () =>
          mockDelay({
            regionOptions: schemeRegionOptions,
            partnerTypeOptions: schemePartnerTypeOptions,
            giftProductOptions: mockGifts.map((gift) => ({
              id: gift.id,
              name: gift.giftName,
              image: gift.giftImage,
              price: gift.price,
              dealerBasePoints: gift.dealerBasePoints,
              chemistBasePoints: gift.chemistBasePoints,
            })),
            masterProductOptions: mockProducts.map((product) => ({
              id: product.id,
              name: product.productName,
              code: product.productCode,
              category: product.productCategory,
              dealerRewardPoints: product.dealerRewardPoints,
              chemistRewardPoints: product.chemistRewardPoints,
            })),
          }),
      }),
      providesTags: [{ type: 'Schemes', id: 'FORM_OPTIONS' }],
    }),

    checkSchemeNameAvailable: builder.query<boolean, { name: string; excludeId?: string }>({
      query: ({ name, excludeId }) => ({
        tag: 'Schemes',
        url: '/schemes/check-name',
        params: { name, excludeId },
        mockResolver: () => mockDelay(!isNameTaken(name, excludeId), 300),
      }),
    }),

    createScheme: builder.mutation<void, SchemeFormValues>({
      query: (values) => ({
        tag: 'Schemes',
        url: '/schemes',
        method: 'POST',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [{ type: 'Schemes', id: 'LIST' }, { type: 'Schemes', id: 'KPIS' }],
    }),

    updateScheme: builder.mutation<void, { id: string; values: SchemeFormValues }>({
      query: ({ id, values }) => ({
        tag: 'Schemes',
        url: `/schemes/${id}`,
        method: 'PUT',
        data: values,
        mockResolver: () => {
          setSchemeStatus(id, values.status)
          return Promise.resolve()
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Schemes', id },
        { type: 'Schemes', id: 'LIST' },
        { type: 'Schemes', id: 'KPIS' },
      ],
    }),

    updateSchemeStatus: builder.mutation<Scheme | undefined, { id: string; status: SchemeStatus }>({
      query: ({ id, status }) => ({
        tag: 'Schemes',
        url: `/schemes/${id}/status`,
        method: 'PATCH',
        data: { status },
        mockResolver: () => mockDelay(setSchemeStatus(id, status), 300),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Schemes', id },
        { type: 'Schemes', id: 'LIST' },
        { type: 'Schemes', id: 'KPIS' },
      ],
    }),

    deleteScheme: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Schemes',
        url: `/schemes/${id}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Schemes', id },
        { type: 'Schemes', id: 'LIST' },
        { type: 'Schemes', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetAllSchemesQuery,
  useGetGeneralSchemesQuery,
  useGetSeasonalSchemesQuery,
  useGetSchemeDetailQuery,
  useGetAllSchemeKpisQuery,
  useGetGeneralSchemeKpisQuery,
  useGetSeasonalSchemeKpisQuery,
  useGetSchemeFormOptionsQuery,
  useLazyCheckSchemeNameAvailableQuery,
  useCreateSchemeMutation,
  useUpdateSchemeMutation,
  useUpdateSchemeStatusMutation,
  useDeleteSchemeMutation,
} = schemesApi
