import {
  mockApprovalRequests,
  getApprovalRequestById,
  approvalRequestKpis,
  rejectedRequestKpis,
} from '@/features/userManagement/mockApprovalRequests'
import type { ApprovalRequest, ApprovalStatus } from '@/features/userManagement/types/userManagement.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// verification API is available.

async function getApprovalRequests(status?: ApprovalStatus): Promise<ApprovalRequest[]> {
  const all = mockApprovalRequests
  return mockDelay(status ? all.filter((request) => request.status === status) : all)
}

async function getApprovalRequestDetail(id: string): Promise<ApprovalRequest | undefined> {
  return mockDelay(getApprovalRequestById(id))
}

async function getApprovalRequestKpis() {
  return mockDelay(approvalRequestKpis)
}

async function getRejectedRequestKpis() {
  return mockDelay(rejectedRequestKpis)
}

async function getRejectedReviewers(): Promise<string[]> {
  const reviewers = new Set(
    mockApprovalRequests.filter((r) => r.status === 'rejected').map((r) => r.reviewedBy).filter((name): name is string => !!name),
  )
  return mockDelay(Array.from(reviewers))
}

// TODO: wire to real endpoints. Currently no-ops that resolve immediately so
// hooks/UI can be built against a stable contract.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function decideApprovalRequest(_id: string, _decision: 'approve' | 'reject', _remarks?: string): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function reopenRequest(_id: string): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function deleteRequest(_id: string): Promise<void> {
  return Promise.resolve()
}

export const verificationService = {
  getApprovalRequests,
  getApprovalRequestDetail,
  getApprovalRequestKpis,
  getRejectedRequestKpis,
  getRejectedReviewers,
  decideApprovalRequest,
  reopenRequest,
  deleteRequest,
}
