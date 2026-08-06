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
  referenceId?: string
  employeeCode?: string
  email: string
  country?: string
  phone: string
  fullName: string
  note?: string
  profileImageUrl?: string | null
  status?: string
  dealerCount?: number
  chemistCount?: number
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  isBlocked?: boolean
  blockedReason?: string
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
    name: item.fullName || 'Unknown',
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
    referenceId: data.referenceId,
    employeeCode: data.employeeCode,
    name: data.fullName || 'Unknown',
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    country: data.country ?? '91',
    region: mapMrRegion(data.region),
    regionId: data.region?.id,
    status: mapMrStatus(data.status, data.isBlocked),
    lastLogin: '-',
    notes: data.note,
    isEmailVerified: data.isEmailVerified,
    isPhoneVerified: data.isPhoneVerified,
    isBlocked: data.isBlocked,
    blockedReason: data.blockedReason,
    profileImageUrl: data.profileImageUrl ?? undefined,
    totalDealersOnboarded: data.dealerCount ?? 0,
    totalChemistsOnboarded: data.chemistCount ?? 0,
    totalPartnersManaged: (data.dealerCount ?? 0) + (data.chemistCount ?? 0),
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

    updateMedicalRep: builder.mutation<void, { id: string; values: MedicalRepApiPayload }>({
      query: ({ id, values }) => ({
        tag: 'MedicalRepDetail',
        url: `/medical-representatives/${id}`,
        method: 'PUT',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      onQueryStarted: async ({ id, values }, { dispatch, getState, queryFulfilled }) => {
        const patches = [
          dispatch(
            medicalRepsApi.util.updateQueryData(
              'getMedicalRepDetail',
              id,
              (draft) => {
                if (!draft) return
                draft.fullName = values.fullName
                draft.name = values.fullName
                draft.email = values.email
                draft.phone = values.phone
                draft.country = values.country
                draft.regionId = values.regionId
              },
            ),
          ),
        ]

        const listArgsList = medicalRepsApi.util.selectCachedArgsForQuery(
          getState(),
          'getMedicalReps',
        )

        for (const listArgs of listArgsList) {
          patches.push(
            dispatch(
              medicalRepsApi.util.updateQueryData(
                'getMedicalReps',
                listArgs,
                (draft) => {
                  const mr = draft.find((item) => item.id === id)
                  if (!mr) return
                  mr.fullName = values.fullName
                  mr.name = values.fullName
                  mr.email = values.email
                  mr.phone = values.phone
                  mr.country = values.country
                  mr.regionId = values.regionId
                },
              ),
            ),
          )
        }

        try {
          await queryFulfilled
        } catch {
          patches.forEach((patch) => patch.undo())
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'MedicalReps', id },
        { type: 'MedicalReps', id: 'LIST' },
      ],
    }),

    setMedicalRepStatus: builder.mutation<void, { id: string; status: PartnerStatus }>({
      query: ({ id, status }) => ({
        tag: 'MedicalRepDetail',
        url: `/medical-representatives/${id}/${status === 'active' ? 'active' : 'inactive'}`,
        method: 'PATCH',
        mockResolver: () => Promise.resolve(),
      }),
      onQueryStarted: async ({ id, status }, { dispatch, getState, queryFulfilled }) => {
        const patches = [
          dispatch(
            medicalRepsApi.util.updateQueryData(
              'getMedicalRepDetail',
              id,
              (draft) => {
                if (draft) draft.status = status
              },
            ),
          ),
        ]

        const listArgsList = medicalRepsApi.util.selectCachedArgsForQuery(
          getState(),
          'getMedicalReps',
        )

        for (const listArgs of listArgsList) {
          patches.push(
            dispatch(
              medicalRepsApi.util.updateQueryData(
                'getMedicalReps',
                listArgs,
                (draft) => {
                  const mr = draft.find((item) => item.id === id)
                  if (mr) mr.status = status
                },
              ),
            ),
          )
        }

        try {
          await queryFulfilled
        } catch {
          patches.forEach((patch) => patch.undo())
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'MedicalReps', id },
        { type: 'MedicalReps', id: 'LIST' },
      ],
    }),

    deleteMedicalRep: builder.mutation<void, { id: string; replacementMrId: string }>({
      query: ({ id, replacementMrId }) => ({
        tag: 'MedicalRepDetail',
        url: `/medical-representatives/${id}`,
        method: 'DELETE',
        data: {
          replacementMrId,
          assignedMedicalRepresentativeId: replacementMrId,
        },
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
