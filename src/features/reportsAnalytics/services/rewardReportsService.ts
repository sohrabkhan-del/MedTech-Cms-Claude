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

async function getRewardReports(): Promise<RewardReportEntry[]> {
  return Promise.resolve(mockRewardReports)
}

async function getRewardReportDetail(id: string): Promise<RewardReportEntry | undefined> {
  return Promise.resolve(getRewardReportById(id))
}

async function getRewardReportKpis() {
  return Promise.resolve(rewardReportKpis)
}

async function getRewardReportFilterOptions() {
  return Promise.resolve({
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
