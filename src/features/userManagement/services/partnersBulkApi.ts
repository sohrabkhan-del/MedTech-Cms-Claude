import { baseApi } from '@/store/api/baseApi'
import { mockDelay } from '@/services/mockDelay'

export interface PartnerBulkRow {
  email: string
  phone: string
  type: 'DEALER' | 'CHEMIST'
  businessName: string
  ownerName: string
  gstNumber?: string
  regionCode: string
  mrEmail: string
  outletName?: string
  addressLine1?: string
  city?: string
  state?: string
  pincode?: string
}

export interface PartnerBulkPayload {
  rows: PartnerBulkRow[]
}

export interface PartnerBulkRowError {
  row: number
  message: string
}

export interface PartnerBulkResult {
  created: number
  failed: number
  errors: PartnerBulkRowError[]
}

export const partnersBulkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    bulkCreatePartners: builder.mutation<PartnerBulkResult, PartnerBulkPayload>({
      query: (payload) => ({
        tag: 'Partners',
        url: '/partners/bulk',
        method: 'POST',
        data: payload,
        mockResolver: () =>
          mockDelay({ created: payload.rows.length, failed: 0, errors: [] }),
      }),
      invalidatesTags: [
        { type: 'Partners', id: 'LIST' },
        { type: 'Partners', id: 'KPIS' },
      ],
    }),
  }),
})

export const { useBulkCreatePartnersMutation } = partnersBulkApi
