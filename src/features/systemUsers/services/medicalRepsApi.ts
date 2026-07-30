// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockMedicalReps,
  getMedicalRepById,
  getReplacementMrOptions,
} from '@/features/systemUsers/mockMedicalReps'
import type {
  MedicalRepresentative,
  PartnerStatus,
  PartnerZone,
} from '@/features/systemUsers/types/systemUsers.types'
import type { MedicalRepApiPayload } from '@/features/systemUsers/medicalRepFormSchema'
import { mockDelay } from '@/services/mockDelay'

export interface MedicalRepQueryParams {
  page?: number
  limit?: number
  search?: string
  regionId?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface MedicalRepApiItem {
  id: string
  employeeCode?: string
  email: string
  country?: string
  phone: string
  firstName: string
  lastName: string
  profileImageUrl?: string | null
  status?: string
  dealerCount?: number
  chemistCount?: number
  isBlocked?: boolean
  region?: { id: string; code: string; name: string } | null
}

interface MedicalRepDetailApiResponse {
  success: boolean
  data: MedicalRepApiItem
}

interface MedicalRepListApiResponse {
  success: boolean
  data: {
    items: MedicalRepApiItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

/** Lightweight option shape for MR-picker dropdowns (create/edit forms, filters). */
export interface MedicalRepOption {
  id: string
  name: string
  employeeCode?: string
}

function mapMedicalRepOption(item: MedicalRepApiItem): MedicalRepOption {
  return {
    id: item.id,
    name: [item.firstName, item.lastName].filter(Boolean).join(' ').trim() || 'Unknown',
    employeeCode: item.employeeCode,
  }
}

function mapMrStatus(status?: string, isBlocked?: boolean): PartnerStatus {
  if (isBlocked) return 'inactive'
  if (status === 'ACTIVE') return 'active'
  if (status === 'PENDING_APPROVAL') return 'pending'
  if (status === 'SUSPENDED') return 'suspended'
  return 'inactive'
}

function mapStatusParam(status?: string) {
  if (!status || status === 'all') return undefined
  if (status === 'active') return 'ACTIVE'
  if (status === 'pending') return 'PENDING_APPROVAL'
  if (status === 'inactive') return 'INACTIVE'
  if (status === 'suspended') return 'SUSPENDED'
  return status
}

function mapMrRegion(region?: { name: string } | null): PartnerZone {
  const name = region?.name?.trim()
  if (name === 'North' || name === 'South' || name === 'East' || name === 'West') return name
  return 'North'
}

function mapMedicalRepDetail(data: MedicalRepDetailApiResponse['data']): MedicalRepresentative {
  return {
    id: data.id,
    name: [data.firstName, data.lastName].filter(Boolean).join(' ').trim() || 'Unknown',
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    country: data.country ?? '91',
    region: mapMrRegion(data.region),
    regionId: data.region?.id,
    status: mapMrStatus(data.status, data.isBlocked),
    lastLogin: '-',
    totalDealersOnboarded: data.dealerCount ?? 0,
    totalChemistsOnboarded: data.chemistCount ?? 0,
    totalPartnersManaged: (data.dealerCount ?? 0) + (data.chemistCount ?? 0),
    managedPartners: [],
  }
}

// create/update/setStatus/deleteMedicalRep are currently no-ops resolving
// immediately so the UI/hook contract is stable ahead of the real API.

const medicalRepsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicalReps: builder.query<MedicalRepresentative[], MedicalRepQueryParams | void>({
      query: (params) => ({
        tag: 'MedicalRepDetail',
        url: '/medical-representatives',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          regionId: params?.regionId || undefined,
          status: mapStatusParam(params?.status),
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder ?? 'desc',
        },
        mockResolver: () => mockDelay(mockMedicalReps),
      }),
      transformResponse: (response: MedicalRepListApiResponse | MedicalRepresentative[]) =>
        Array.isArray(response)
          ? response
          : response.data.items.map(mapMedicalRepDetail),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'MedicalReps' as const, id })),
              { type: 'MedicalReps' as const, id: 'LIST' },
            ]
          : [{ type: 'MedicalReps' as const, id: 'LIST' }],
    }),

    getMedicalRepDetail: builder.query<MedicalRepresentative | undefined, string>({
      query: (id) => ({
        tag: 'MedicalRepDetail',
        url: `/medical-representatives/${id}`,
        mockResolver: () => mockDelay(getMedicalRepById(id)),
      }),
      transformResponse: (response: MedicalRepDetailApiResponse | MedicalRepresentative | undefined) =>
        response && 'data' in response ? mapMedicalRepDetail(response.data) : response,
      providesTags: (_result, _error, id) => [{ type: 'MedicalReps', id }],
    }),

    getMedicalRepOptions: builder.query<MedicalRepOption[], { search?: string } | void>({
      query: (params) => ({
        tag: 'MedicalRepDetail',
        url: '/medical-representatives',
        params: {
          page: 1,
          limit: 50,
          status: 'ACTIVE',
          search: params?.search || undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
        mockResolver: () => mockDelay(mockMedicalReps.map((mr) => ({ id: mr.id, name: mr.name }))),
      }),
      transformResponse: (response: MedicalRepListApiResponse | MedicalRepOption[]) =>
        Array.isArray(response)
          ? response
          : response.data.items.map(mapMedicalRepOption),
      providesTags: [{ type: 'MedicalReps', id: 'OPTIONS' }],
    }),

    getReplacementMrs: builder.query<MedicalRepresentative[], { region: PartnerZone; excludeId: string }>({
      query: ({ region, excludeId }) => ({
        tag: 'MedicalReps',
        url: '/medical-reps/replacement-options',
        params: { region, excludeId },
        mockResolver: () => mockDelay(getReplacementMrOptions(region, excludeId)),
      }),
      providesTags: [{ type: 'MedicalReps', id: 'REPLACEMENT_OPTIONS' }],
    }),

    createMedicalRep: builder.mutation<void, MedicalRepApiPayload>({
      query: (payload) => ({
        tag: 'MedicalRepDetail',
        url: '/medical-representatives',
        method: 'POST',
        data: payload,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [{ type: 'MedicalReps', id: 'LIST' }],
    }),

    // updateMedicalRep/setMedicalRepStatus/deleteMedicalRep: real endpoints
    // not yet confirmed (unlike create, list, and detail above) — still
    // pointing at the old placeholder /medical-reps path and resolving as
    // mock no-ops until the real PUT/PATCH/DELETE shapes are confirmed.
    updateMedicalRep: builder.mutation<void, { id: string; values: MedicalRepApiPayload }>({
      query: ({ id, values }) => ({
        tag: 'MedicalReps',
        url: `/medical-reps/${id}`,
        method: 'PUT',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'MedicalReps', id },
        { type: 'MedicalReps', id: 'LIST' },
      ],
    }),

    setMedicalRepStatus: builder.mutation<void, { id: string; status: PartnerStatus }>({
      query: ({ id, status }) => ({
        tag: 'MedicalReps',
        url: `/medical-reps/${id}/status`,
        method: 'PATCH',
        data: { status },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'MedicalReps', id },
        { type: 'MedicalReps', id: 'LIST' },
      ],
    }),

    deleteMedicalRep: builder.mutation<void, { id: string; replacementMrId: string }>({
      query: ({ id, replacementMrId }) => ({
        tag: 'MedicalReps',
        url: `/medical-reps/${id}`,
        method: 'DELETE',
        data: { replacementMrId },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'MedicalReps', id },
        { type: 'MedicalReps', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetMedicalRepsQuery,
  useGetMedicalRepDetailQuery,
  useGetMedicalRepOptionsQuery,
  useGetReplacementMrsQuery,
  useLazyGetReplacementMrsQuery,
  useCreateMedicalRepMutation,
  useUpdateMedicalRepMutation,
  useSetMedicalRepStatusMutation,
  useDeleteMedicalRepMutation,
} = medicalRepsApi
