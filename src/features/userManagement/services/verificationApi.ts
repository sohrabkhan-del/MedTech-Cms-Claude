// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockApprovalRequests,
  getApprovalRequestById,
  approvalRequestKpis,
  rejectedRequestKpis,
} from '@/features/userManagement/mockApprovalRequests'
import type { ApprovalRequest, ApprovalStatus } from '@/features/userManagement/types/userManagement.types'
import { mockDelay } from '@/services/mockDelay'

// decideApprovalRequest/reopenRequest/deleteRequest/updateDocument are
// currently no-ops resolving immediately so the UI/hook contract is stable
// ahead of the real API.

function getRejectedReviewersList(): string[] {
  const reviewers = new Set(
    mockApprovalRequests
      .filter((r) => r.status === 'rejected')
      .map((r) => r.reviewedBy)
      .filter((name): name is string => !!name),
  )
  return Array.from(reviewers)
}

const verificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApprovalRequests: builder.query<ApprovalRequest[], ApprovalStatus | void>({
      query: (status) => ({
        tag: 'Verification',
        url: '/verification/requests',
        params: { status },
        mockResolver: () =>
          mockDelay(
            status ? mockApprovalRequests.filter((request) => request.status === status) : mockApprovalRequests,
          ),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Verification' as const, id })),
              { type: 'Verification' as const, id: 'LIST' },
            ]
          : [{ type: 'Verification' as const, id: 'LIST' }],
    }),

    getApprovalRequestDetail: builder.query<ApprovalRequest | undefined, string>({
      query: (id) => ({
        tag: 'Verification',
        url: `/verification/requests/${id}`,
        mockResolver: () => mockDelay(getApprovalRequestById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'Verification', id }],
    }),

    getApprovalRequestKpis: builder.query<typeof approvalRequestKpis, void>({
      query: () => ({
        tag: 'Verification',
        url: '/verification/requests/kpis',
        mockResolver: () => mockDelay(approvalRequestKpis),
      }),
      providesTags: [{ type: 'Verification', id: 'KPIS' }],
    }),

    getRejectedRequestKpis: builder.query<typeof rejectedRequestKpis, void>({
      query: () => ({
        tag: 'Verification',
        url: '/verification/requests/rejected/kpis',
        mockResolver: () => mockDelay(rejectedRequestKpis),
      }),
      providesTags: [{ type: 'Verification', id: 'REJECTED_KPIS' }],
    }),

    getRejectedReviewers: builder.query<string[], void>({
      query: () => ({
        tag: 'Verification',
        url: '/verification/requests/rejected/reviewers',
        mockResolver: () => mockDelay(getRejectedReviewersList()),
      }),
      providesTags: [{ type: 'Verification', id: 'REJECTED_REVIEWERS' }],
    }),

    decideApprovalRequest: builder.mutation<void, { id: string; decision: 'approve' | 'reject'; remarks?: string }>({
      query: ({ id, decision, remarks }) => ({
        tag: 'Verification',
        url: `/verification/requests/${id}/decision`,
        method: 'POST',
        data: { decision, remarks },
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Verification', id },
        { type: 'Verification', id: 'LIST' },
        { type: 'Verification', id: 'KPIS' },
        { type: 'Verification', id: 'REJECTED_KPIS' },
      ],
    }),

    reopenRequest: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Verification',
        url: `/verification/requests/${id}/reopen`,
        method: 'POST',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Verification', id },
        { type: 'Verification', id: 'LIST' },
        { type: 'Verification', id: 'KPIS' },
        { type: 'Verification', id: 'REJECTED_KPIS' },
      ],
    }),

    deleteRequest: builder.mutation<void, string>({
      query: (id) => ({
        tag: 'Verification',
        url: `/verification/requests/${id}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Verification', id },
        { type: 'Verification', id: 'LIST' },
        { type: 'Verification', id: 'KPIS' },
        { type: 'Verification', id: 'REJECTED_KPIS' },
      ],
    }),

    updateDocument: builder.mutation<void, { requestId: string; documentId: string; file: File }>({
      query: ({ requestId, documentId, file }) => ({
        tag: 'Verification',
        url: `/verification/requests/${requestId}/documents/${documentId}`,
        method: 'PUT',
        data: file,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { requestId }) => [{ type: 'Verification', id: requestId }],
    }),
  }),
})

export const {
  useGetApprovalRequestsQuery,
  useGetApprovalRequestDetailQuery,
  useGetApprovalRequestKpisQuery,
  useGetRejectedRequestKpisQuery,
  useGetRejectedReviewersQuery,
  useDecideApprovalRequestMutation,
  useReopenRequestMutation,
  useDeleteRequestMutation,
  useUpdateDocumentMutation,
} = verificationApi
