import { mockInterestedUsers, getInterestedUserById, interestedUserKpis } from '@/features/marketing/mockInterestedUsers'
import { mrs } from '@/features/partners/mockPartnerData'
import type { InterestedUserLead, LeadStatus } from '@/features/marketingProducts/types/marketingProducts.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// interested users API is available. setLeadStatus/deleteLead are currently
// no-ops resolving immediately so the UI/hook contract is stable ahead of time.

async function getInterestedUsers(): Promise<InterestedUserLead[]> {
  return Promise.resolve(mockInterestedUsers)
}

async function getInterestedUserDetail(id: string): Promise<InterestedUserLead | undefined> {
  return Promise.resolve(getInterestedUserById(id))
}

async function getInterestedUserKpis() {
  return Promise.resolve(interestedUserKpis)
}

async function getHandlerOptions(): Promise<string[]> {
  return Promise.resolve(mrs)
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
