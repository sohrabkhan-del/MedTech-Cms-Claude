import { mockInterestedUsers, getInterestedUserById, interestedUserKpis } from '@/features/marketingProducts/mockInterestedUsers'
import { mrs } from '@/features/userManagement/mockPartnerData'
import type { InterestedUserLead, LeadStatus } from '@/features/marketingProducts/types/marketingProducts.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// interested users API is available. setLeadStatus/deleteLead are currently
// no-ops resolving immediately so the UI/hook contract is stable ahead of time.

async function getInterestedUsers(): Promise<InterestedUserLead[]> {
  return mockDelay(mockInterestedUsers)
}

async function getInterestedUserDetail(id: string): Promise<InterestedUserLead | undefined> {
  return mockDelay(getInterestedUserById(id))
}

async function getInterestedUserKpis() {
  return mockDelay(interestedUserKpis)
}

async function getHandlerOptions(): Promise<string[]> {
  return mockDelay(mrs)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setLeadStatus(_id: string, _status: LeadStatus): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function deleteLead(_id: string): Promise<void> {
  return Promise.resolve()
}

export const interestedUsersService = {
  getInterestedUsers,
  getInterestedUserDetail,
  getInterestedUserKpis,
  getHandlerOptions,
  setLeadStatus,
  deleteLead,
}
