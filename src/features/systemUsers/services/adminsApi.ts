// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import { mockAdmins, getAdminById, adminKpis } from '@/features/systemUsers/mockAdmins'
import type { Admin, AdminFormValues, AdminStatus } from '@/features/systemUsers/types/systemUsers.types'
import { mockDelay } from '@/services/mockDelay'

export interface AdminFormOptions {
  regionOptions: Admin['regionAccess'][]
  roleOptions: Admin['role'][]
  statusOptions: Admin['status'][]
}

// create/update/setStatus/deleteAdmin are currently no-ops resolving
// immediately so the UI/hook contract is stable ahead of the real API.

const adminsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmins: builder.query<Admin[], void>({
      query: () => ({ tag: 'Admins', url: '/admins', mockResolver: () => mockDelay(mockAdmins) }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Admins' as const, id })), { type: 'Admins' as const, id: 'LIST' }]
          : [{ type: 'Admins' as const, id: 'LIST' }],
    }),

    getAdminDetail: builder.query<Admin | undefined, string>({
      query: (id) => ({ tag: 'Admins', url: `/admins/${id}`, mockResolver: () => mockDelay(getAdminById(id)) }),
      providesTags: (_result, _error, id) => [{ type: 'Admins', id }],
    }),

    getAdminKpis: builder.query<typeof adminKpis, void>({
      query: () => ({ tag: 'Admins', url: '/admins/kpis', mockResolver: () => mockDelay(adminKpis) }),
      providesTags: [{ type: 'Admins', id: 'KPIS' }],
    }),

    getAdminFormOptions: builder.query<AdminFormOptions, void>({
      query: () => ({
        tag: 'Admins',
        url: '/admins/form-options',
        mockResolver: () =>
          mockDelay({
            regionOptions: ['Pan India', 'North', 'South', 'East', 'West'] as Admin['regionAccess'][],
            roleOptions: ['Super Admin', 'Admin'] as Admin['role'][],
            statusOptions: ['active', 'pending', 'inactive'] as Admin['status'][],
          }),
      }),
      providesTags: [{ type: 'Admins', id: 'FORM_OPTIONS' }],
    }),

    createAdmin: builder.mutation<void, AdminFormValues>({
      query: (values) => ({
        tag: 'Admins',
        url: '/admins',
        method: 'POST',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [{ type: 'Admins', id: 'LIST' }, { type: 'Admins', id: 'KPIS' }],
    }),

    updateAdmin: builder.mutation<void, { id: string; values: AdminFormValues }>({
      query: ({ id, values }) => ({
        tag: 'Admins',
        url: `/admins/${id}`,
        method: 'PUT',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Admins', id },
        { type: 'Admins', id: 'LIST' },
        { type: 'Admins', id: 'KPIS' },
      ],
    }),

    setAdminStatus: builder.mutation<void, { id: string; status: AdminStatus }>({
      query: ({ id, status }) => ({
        tag: 'Admins',
        url: `/admins/${id}/status`,
        method: 'PATCH',
        data: { status },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Admins', id },
        { type: 'Admins', id: 'LIST' },
        { type: 'Admins', id: 'KPIS' },
      ],
    }),
  }),
})

export const {
  useGetAdminsQuery,
  useGetAdminDetailQuery,
  useGetAdminKpisQuery,
  useGetAdminFormOptionsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useSetAdminStatusMutation,
} = adminsApi
