import {
  mockRewardReports,
  getRewardReportById,
  rewardReportKpis,
  rewardReportUserTypeOptions,
  rewardReportTypeOptions,
  rewardReportSchemeOptions,
  rewardReportStatusOptions,
} from '@/features/reportsAnalytics/mockRewardReports'
import type { RewardReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

async function getRewardReports(): Promise<RewardReportEntry[]> {
  return mockDelay(mockRewardReports)
}

async function getRewardReportDetail(id: string): Promise<RewardReportEntry | undefined> {
  return mockDelay(getRewardReportById(id))
}

async function getRewardReportKpis() {
  return mockDelay(rewardReportKpis)
}

async function getRewardReportFilterOptions() {
  return mockDelay({
    userTypeOptions: rewardReportUserTypeOptions,
    rewardTypeOptions: rewardReportTypeOptions,
    schemeOptions: rewardReportSchemeOptions,
    statusOptions: rewardReportStatusOptions,
  })
}

export const rewardReportsService = {
  getRewardReports,
  getRewardReportDetail,
  getRewardReportKpis,
  getRewardReportFilterOptions,
}
