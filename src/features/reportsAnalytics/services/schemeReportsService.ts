import {
  mockSchemeReports,
  getSchemeReportById,
  schemeReportKpis,
  schemeReportRegionOptions,
  schemeReportPartnerTypeOptions,
} from '@/features/reportsAnalytics/mockSchemeReports'
import type { SchemeReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

async function getSchemeReports(): Promise<SchemeReportEntry[]> {
  return mockDelay(mockSchemeReports)
}

async function getSchemeReportDetail(id: string): Promise<SchemeReportEntry | undefined> {
  return mockDelay(getSchemeReportById(id))
}

async function getSchemeReportKpis() {
  return mockDelay(schemeReportKpis)
}

async function getSchemeReportFilterOptions() {
  return mockDelay({
    regionOptions: schemeReportRegionOptions,
    partnerTypeOptions: schemeReportPartnerTypeOptions,
  })
}

export const schemeReportsService = {
  getSchemeReports,
  getSchemeReportDetail,
  getSchemeReportKpis,
  getSchemeReportFilterOptions,
}
