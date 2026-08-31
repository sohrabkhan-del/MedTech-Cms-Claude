import { baseApi } from '@/store/api/baseApi'
import {
  mockAdmins,
  getAdminById,
  adminKpis,
} from '@/features/systemUsers/mockAdmins'
import type {
  Admin,
  AdminFormValues,
  AdminModule,
  AdminModulePermission,
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

export interface AdminAuditQueryParams {
  adminId: string
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface AdminAuditApiResponse {
  success: boolean
  message?: string
  data: {
    items: Array<{
      id: string
      action: string
      entity: string
      entityId?: string | null
      reason?: string | null
      before?: unknown
      after?: unknown
      actorId?: string
      actorType?: string
      actor?: { id: string; type: string; name: string; email?: string }
      ip?: string
      userAgent?: string
      createdAt: string
    }>
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
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
  modulePermissions?: string[]
  region?: { id: string; code: string; name: string } | null
  regions?: Array<{ id: string; code: string; name: string }>
}

interface AdminModulesApiResponse {
  success: boolean
  data: AdminModule[]
}

const fallbackAdminModules: AdminModule[] = [
  {
    code: 'operations',
    name: 'Operations',
    description: 'Core operational workflows and task management.',
  },
  {
    code: 'inventory_management',
    name: 'Inventory Management',
    description: 'Stock, inventory visibility, and stock movement workflows.',
  },
  {
    code: 'partners',
    name: 'Partners',
    description:
      'Partner onboarding, profiles, and partner lifecycle management.',
  },
  {
    code: 'verification',
    name: 'Verification',
    description: 'Approval, review, verification, and compliance checks.',
  },
  {
    code: 'marketing_product',
    name: 'Marketing Product',
    description: 'Marketing and product promotion workflows.',
  },
  {
    code: 'scheme_management',
    name: 'Scheme Management',
    description: 'Campaign, scheme, and benefit configuration management.',
  },
  {
    code: 'reward_wallet',
    name: 'Reward Wallet',
    description: 'Reward wallet and redemption management.',
  },
  {
    code: 'reports_and_analytics',
    name: 'Reports and Analytics',
    description: 'Reporting, KPIs, and analytics dashboards.',
  },
]

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
    modulePermissions: (item.modulePermissions ??
      []) as AdminModulePermission[],
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
    modulePermissions: values.modulePermissions,
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

function applyAdminFormValuesToDraft(
  draft: Admin,
  values: Partial<AdminFormValues>,
) {
  if (values.firstName !== undefined) draft.firstName = values.firstName
  if (values.lastName !== undefined) draft.lastName = values.lastName
  if (values.firstName !== undefined || values.lastName !== undefined) {
    draft.name =
      [draft.firstName, draft.lastName].filter(Boolean).join(' ').trim() ||
      draft.email
  }
  if (values.email !== undefined) {
    draft.email = values.email
    if (!draft.name) draft.name = values.email
  }
  if (values.phone !== undefined) draft.phone = values.phone
  if (values.regionIds !== undefined) {
    draft.regionIds = values.regionIds
    const regionNames = values.regionIds
      .map((id) => regionCache.find((region) => region.id === id)?.name)
      .filter((name): name is string => Boolean(name))
    draft.regionAccess = regionNamesToAccess(regionNames)
  }
  if (values.modulePermissions !== undefined) {
    draft.modulePermissions =
      values.modulePermissions as AdminModulePermission[]
  }
}

// create/update are currently no-ops resolving immediately in mock mode so
// the UI/hook contract is stable; real mode calls the actual /admins API.

const adminsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminModules: builder.query<AdminModule[], void>({
      query: () => ({
        tag: 'Admins',
        url: '/admins/modules',
        mockResolver: () => mockDelay(fallbackAdminModules),
      }),
      transformResponse: (response: AdminModulesApiResponse | AdminModule[]) =>
        Array.isArray(response) ? response : response.data,
    }),

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
      keepUnusedDataFor: 300,
    }),

    getAdminAnalytics: builder.query<
      AdminKpis,
      AnalyticsDateParams & { regionId?: string }
    >({
      query: (params) => ({
        tag: 'Admins',
        url: '/analytics-cards/admins',
        params: {
          preset: params.preset,
          startDate: params.startDate,
          endDate: params.endDate,
          regionId: params.regionId || undefined,
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
      onQueryStarted: async (
        { id, values },
        { dispatch, getState, queryFulfilled },
      ) => {
        const patches = [
          dispatch(
            adminsApi.util.updateQueryData('getAdminDetail', id, (draft) => {
              if (draft) applyAdminFormValuesToDraft(draft, values)
            }),
          ),
        ]

        const listArgsList = adminsApi.util.selectCachedArgsForQuery(
          getState(),
          'getAdmins',
        )

        for (const listArgs of listArgsList) {
          patches.push(
            dispatch(
              adminsApi.util.updateQueryData('getAdmins', listArgs, (draft) => {
                const admin = draft.find((item) => item.id === id)
                if (admin) applyAdminFormValuesToDraft(admin, values)
              }),
            ),
          )
        }

        try {
          await queryFulfilled
        } catch {
          patches.forEach((patch) => patch.undo())
        }
      },
      invalidatesTags: [
        { type: 'Admins', id: 'LIST' },
        { type: 'Admins', id: 'KPIS' },
      ],
    }),

    updateAdminModules: builder.mutation<
      void,
      { id: string; modulePermissions: string[] }
    >({
      query: ({ id, modulePermissions }) => ({
        tag: 'Admins',
        url: `/admins/${id}/modules`,
        method: 'PATCH',
        data: { modulePermissions },
        mockResolver: () => Promise.resolve(),
      }),
      onQueryStarted: async (
        { id, modulePermissions },
        { dispatch, getState, queryFulfilled },
      ) => {
        const values = { modulePermissions }
        const patches = [
          dispatch(
            adminsApi.util.updateQueryData('getAdminDetail', id, (draft) => {
              if (draft) applyAdminFormValuesToDraft(draft, values)
            }),
          ),
        ]

        const listArgsList = adminsApi.util.selectCachedArgsForQuery(
          getState(),
          'getAdmins',
        )

        for (const listArgs of listArgsList) {
          patches.push(
            dispatch(
              adminsApi.util.updateQueryData('getAdmins', listArgs, (draft) => {
                const admin = draft.find((item) => item.id === id)
                if (admin) applyAdminFormValuesToDraft(admin, values)
              }),
            ),
          )
        }

        try {
          await queryFulfilled
        } catch {
          patches.forEach((patch) => patch.undo())
        }
      },
      invalidatesTags: [{ type: 'Admins', id: 'LIST' }],
    }),

    setAdminStatus: builder.mutation<void, { id: string; status: AdminStatus }>(
      {
        query: ({ id, status }) => ({
          tag: 'Admins',
          url: `/admins/${id}/${status === 'active' ? 'activate' : 'deactivate'}`,
          method: 'PATCH',
          mockResolver: () => Promise.resolve(),
        }),
        onQueryStarted: async (
          { id, status },
          { dispatch, getState, queryFulfilled },
        ) => {
          const patches = [
            dispatch(
              adminsApi.util.updateQueryData('getAdminDetail', id, (draft) => {
                if (draft) draft.status = status
              }),
            ),
          ]

          const listArgsList = adminsApi.util.selectCachedArgsForQuery(
            getState(),
            'getAdmins',
          )

          for (const listArgs of listArgsList) {
            patches.push(
              dispatch(
                adminsApi.util.updateQueryData(
                  'getAdmins',
                  listArgs,
                  (draft) => {
                    const admin = draft.find((item) => item.id === id)
                    if (admin) admin.status = status
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
        invalidatesTags: [{ type: 'Admins', id: 'KPIS' }],
      },
    ),

    /** GET /audit/admin/:adminId — admin audit timeline with server-side paging/search/sort */
    getAdminAudit: builder.query<
      AdminAuditApiResponse['data'],
      AdminAuditQueryParams | void
    >({
      query: (params) => ({
        tag: 'Admins',
        url: `/audit/admin/${params?.adminId}`,
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 2,
          search: params?.search || undefined,
          sortBy: params?.sortBy || 'createdAt',
          sortOrder: params?.sortOrder || 'desc',
        },
        mockResolver: () =>
          mockDelay({
            items: [],
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
            pageSize: params?.limit ?? 2,
          }),
      }),
      transformResponse: (
        response: AdminAuditApiResponse | AdminAuditApiResponse['data'],
      ) => ('data' in response ? response.data : response),
      providesTags: (result, _error, arg) =>
        result
          ? [
              ...result.items.map((it) => ({
                type: 'Admins' as const,
                id: it.id,
              })),
              { type: 'Admins' as const, id: `AUDIT_${arg?.adminId}` },
            ]
          : [{ type: 'Admins' as const, id: `AUDIT_${arg?.adminId}` }],
    }),
  }),
})

export const {
  useGetAdminsQuery,
  useGetAdminDetailQuery,
  useGetAdminModulesQuery,
  useGetAdminAnalyticsQuery,
  useGetAdminAuditQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useUpdateAdminModulesMutation,
  useSetAdminStatusMutation,
} = adminsApi
