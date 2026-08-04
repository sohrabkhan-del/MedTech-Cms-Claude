import { baseApi } from '@/store/api/baseApi'
import {
  mockAdmins,
  getAdminById,
  adminKpis,
} from '@/features/systemUsers/mockAdmins'
import type {
  Admin,
  AdminFormValues,
  AdminStatus,
} from '@/features/systemUsers/types/systemUsers.types'
import { mockDelay } from '@/services/mockDelay'
import { getRegions, fallbackRegions } from '@/services/regionsService'
import type { RegionOption } from '@/contexts/RegionFilterContext'
import type { AnalyticsDateParams } from '@/utils/dateRangeToAnalyticsParams'
import { formatDate } from '@/utils/formatDate'

export interface AdminKpis {
  totalAdmins: number
  activeAdmins: number
  pendingAdmins: number
  inactiveAdmins: number
}

export interface AdminQueryParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  regionId?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  preset?: string
  startDate?: string
  endDate?: string
}

interface AdminListApiResponse {
  success: boolean
  data: {
    items: AdminApiItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

interface AdminDetailApiResponse {
  success: boolean
  data: AdminApiItem
}

interface AdminApiItem {
  id: string
  firstName?: string | null
  lastName?: string | null
  email: string
  phone?: string | null
  country?: string | null
  profileImageUrl?: string | null
  role: string
  status: string
  createdAt?: string
  totalActionsLogged?: number
  region?: { id: string; code: string; name: string } | null
  regions?: Array<{ id: string; code: string; name: string }>
}

let regionCache: RegionOption[] = fallbackRegions

async function loadRegions(): Promise<RegionOption[]> {
  try {
    regionCache = await getRegions()
  } catch {
    regionCache = fallbackRegions
  }
  return regionCache
}

function regionNamesToAccess(names: string[]): Admin['regionAccess'] {
  if (names.length !== 1) return 'All India'
  const normalized = names[0]?.trim().toLowerCase()
  if (normalized === 'north') return 'North'
  if (normalized === 'south') return 'South'
  if (normalized === 'east') return 'East'
  if (normalized === 'west') return 'West'
  return 'All India'
}

function mapRole(role: string): Admin['role'] {
  return role.toUpperCase() === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'
}

function mapStatus(status: string): AdminStatus {
  const normalized = status.toUpperCase()
  if (normalized === 'ACTIVE') return 'active'
  if (normalized === 'PENDING') return 'pending'
  return 'inactive'
}

interface AdminAnalyticsApiResponse {
  success: boolean
  data: {
    totalAdmins: number
    totalAdminsChange: number
    activeAdmins: number
    activeAdminsChange: number
    inactiveAdmins: number
    inactiveAdminsChange: number
    pendingApprovalAdmins: number
    pendingApprovalAdminsChange: number
  }
}

function mapAdminAnalytics(response: AdminAnalyticsApiResponse): AdminKpis {
  const data = response.data
  return {
    totalAdmins: data.totalAdmins,
    activeAdmins: data.activeAdmins,
    pendingAdmins: data.pendingApprovalAdmins,
    inactiveAdmins: data.inactiveAdmins,
  }
}

function mapStatusParam(status?: string) {
  if (!status || status === 'all') return undefined
  if (status === 'active') return 'ACTIVE'
  if (status === 'pending') return 'PENDING'
  if (status === 'inactive') return 'INACTIVE'
  return status
}

function normalizePhoneDisplay(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '')
  return digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly
}

function mapAdminItem(item: AdminApiItem): Admin {
  const firstName = item.firstName?.trim() ?? ''
  const lastName = item.lastName?.trim() ?? ''
  const name =
    [firstName, lastName].filter(Boolean).join(' ').trim() || item.email
  const regionList = item.regions ?? (item.region ? [item.region] : [])

  return {
    id: item.id,
    name,
    firstName,
    lastName,
    email: item.email,
    phone: item.phone ? normalizePhoneDisplay(item.phone) : '-',
    regionAccess: regionNamesToAccess(regionList.map((r) => r.name)),
    regionIds: regionList.map((r) => r.id),
    role: mapRole(item.role),
    status: mapStatus(item.status),
    totalActionsLogged: item.totalActionsLogged ?? 0,
    createdDate: formatDate(item.createdAt),
    recentActivity: [],
  }
}

function mapFormValuesToCreatePayload(values: AdminFormValues) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone,
    country: '91',
    profileImageUrl: '',
    regionIds: values.regionIds,
    role: 'ADMIN',
    status: 'ACTIVE',
  }
}

function mapFormValuesToUpdatePayload(values: AdminFormValues) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone,
    country: '91',
    profileImageUrl: '',
    regionIds: values.regionIds,
  }
}

// create/update are currently no-ops resolving immediately in mock mode so
// the UI/hook contract is stable; real mode calls the actual /admins API.

const adminsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmins: builder.query<Admin[], AdminQueryParams | void>({
      query: (params) => ({
        tag: 'Admins',
        url: '/admins',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          role: params?.role || undefined,
          regionId: params?.regionId || undefined,
          status: mapStatusParam(params?.status),
          sortBy: params?.sortBy || 'createdAt',
          sortOrder: params?.sortOrder ?? 'desc',
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () => mockDelay(mockAdmins),
      }),
      transformResponse: async (response: AdminListApiResponse | Admin[]) => {
        if (Array.isArray(response)) return response
        await loadRegions()
        return response.data.items.map(mapAdminItem)
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Admins' as const, id })),
              { type: 'Admins' as const, id: 'LIST' },
            ]
          : [{ type: 'Admins' as const, id: 'LIST' }],
    }),

    getAdminDetail: builder.query<Admin | undefined, string>({
      query: (id) => ({
        tag: 'Admins',
        url: `/admins/${id}`,
        mockResolver: () => mockDelay(getAdminById(id)),
      }),
      transformResponse: async (
        response: AdminDetailApiResponse | Admin | undefined,
      ) => {
        if (!response || !('data' in response)) return response
        await loadRegions()
        return mapAdminItem(response.data)
      },
      providesTags: (_result, _error, id) => [{ type: 'Admins', id }],
    }),

    getAdminAnalytics: builder.query<AdminKpis, AnalyticsDateParams>({
      query: (params) => ({
        tag: 'Admins',
        url: '/analytics-cards/admins',
        params: {
          preset: params.preset,
          startDate: params.startDate,
          endDate: params.endDate,
        },
        mockResolver: () => mockDelay(adminKpis),
      }),
      transformResponse: (response: AdminAnalyticsApiResponse | AdminKpis) =>
        'data' in response ? mapAdminAnalytics(response) : response,
      providesTags: [{ type: 'Admins', id: 'KPIS' }],
    }),

    createAdmin: builder.mutation<void, AdminFormValues>({
      query: (values) => ({
        tag: 'Admins',
        url: '/admins/create',
        method: 'POST',
        data: mapFormValuesToCreatePayload(values),
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [
        { type: 'Admins', id: 'LIST' },
        { type: 'Admins', id: 'KPIS' },
      ],
    }),

    updateAdmin: builder.mutation<
      void,
      { id: string; values: AdminFormValues }
    >({
      query: ({ id, values }) => ({
        tag: 'Admins',
        url: `/admins/${id}`,
        method: 'PUT',
        data: mapFormValuesToUpdatePayload(values),
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Admins', id },
        { type: 'Admins', id: 'LIST' },
        { type: 'Admins', id: 'KPIS' },
      ],
    }),

    setAdminStatus: builder.mutation<void, { id: string; status: AdminStatus }>(
      {
        query: ({ id, status }) => ({
          tag: 'Admins',
          url: `/admins/${id}/${status === 'active' ? 'activate' : 'deactivate'}`,
          method: 'PATCH',
          mockResolver: () => Promise.resolve(),
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: 'Admins', id },
          { type: 'Admins', id: 'LIST' },
          { type: 'Admins', id: 'KPIS' },
        ],
      },
    ),
  }),
})

export const {
  useGetAdminsQuery,
  useGetAdminDetailQuery,
  useGetAdminAnalyticsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useSetAdminStatusMutation,
} = adminsApi
