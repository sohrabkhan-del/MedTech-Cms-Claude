import { baseApi } from '@/store/api/baseApi'
import { mockDelay } from '@/services/mockDelay'

export type MrPartnerType = 'CHEMIST' | 'DEALER'

export interface MrPartnersQueryParams {
  assignedMedicalRepresentativeId: string
  type: MrPartnerType
  page?: number
  limit?: number
  sortOrder?: 'asc' | 'desc'
}

interface PartnerBusinessApiItem {
  id: string
  outletName?: string | null
  city?: string | null
  state?: string | null
  approvalStatus?: string | null
}

interface MrPartnerApiItem {
  id: string
  referenceId: string
  type: MrPartnerType
  businessName: string
  ownerName: string
  email?: string | null
  phone?: string | null
  status: string
  isBlocked?: boolean
  createdAt: string
  business?: PartnerBusinessApiItem[]
}

interface MrPartnersListApiResponse {
  success: boolean
  data: {
    items: MrPartnerApiItem[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

export interface MrPartnerRow {
  id: string
  referenceId: string
  type: MrPartnerType
  businessName: string
  ownerName: string
  city: string
  email: string
  phone: string
  status: string
  isBlocked: boolean
  createdAt: string
}

function mapMrPartner(item: MrPartnerApiItem): MrPartnerRow {
  const business = item.business?.[0]
  return {
    id: item.id,
    referenceId: item.referenceId,
    type: item.type,
    businessName: business?.outletName || item.businessName || '-',
    ownerName: item.ownerName || '-',
    city: business?.city || '-',
    email: item.email || '-',
    phone: item.phone || '-',
    status: item.status,
    isBlocked: item.isBlocked ?? false,
    createdAt: item.createdAt,
  }
}

const mrPartnersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMrPartners: builder.query<
      { items: MrPartnerRow[]; totalItems: number },
      MrPartnersQueryParams
    >({
      query: (params) => ({
        tag: 'Partners',
        url: '/partners',
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          assignedMedicalRepresentativeId: params.assignedMedicalRepresentativeId,
          type: params.type,
          sortOrder: params.sortOrder ?? 'desc',
        },
        mockResolver: () => mockDelay({ items: [], totalItems: 0 }),
      }),
      transformResponse: (response: MrPartnersListApiResponse) => ({
        items: response.data.items.map(mapMrPartner),
        totalItems: response.data.totalItems,
      }),
      providesTags: (result, _error, params) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Partners' as const, id })),
              { type: 'Partners' as const, id: `MR_${params.assignedMedicalRepresentativeId}_${params.type}` },
            ]
          : [{ type: 'Partners' as const, id: `MR_${params.assignedMedicalRepresentativeId}_${params.type}` }],
    }),
  }),
})

export const { useGetMrPartnersQuery } = mrPartnersApi
