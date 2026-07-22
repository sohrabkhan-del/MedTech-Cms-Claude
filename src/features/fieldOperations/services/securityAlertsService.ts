import {
  mockSecurityAlerts,
  getSecurityAlertById,
  getUserSecuritySummary,
  getUserAlertHistory,
  getUserSecurityTimeline,
  securityAlertKpis,
} from '@/features/fieldOperations/mocks/mockSecurityAlerts'
import type { SecurityAlert } from '@/features/fieldOperations/types/fieldOperations.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// security alerts API is available. `setUserStatus` is currently a no-op
// resolving immediately — swap for a real activate/deactivate endpoint.

async function getSecurityAlerts(): Promise<SecurityAlert[]> {
  return mockDelay(mockSecurityAlerts)
}

async function getSecurityAlertDetail(id: string): Promise<SecurityAlert | undefined> {
  return mockDelay(getSecurityAlertById(id))
}

async function getSecurityAlertKpis() {
  return mockDelay(securityAlertKpis)
}

async function getUserSecurityProfile(userId: string) {
  return mockDelay({
    summary: getUserSecuritySummary(userId),
    alertHistory: getUserAlertHistory(userId),
    timeline: getUserSecurityTimeline(userId),
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setUserStatus(_userId: string, _status: 'active' | 'inactive'): Promise<void> {
  return Promise.resolve()
}

export const securityAlertsService = {
  getSecurityAlerts,
  getSecurityAlertDetail,
  getSecurityAlertKpis,
  getUserSecurityProfile,
  setUserStatus,
}
