import {
  mockSchemeReports,
  getSchemeReportById,
  schemeReportKpis,
  schemeReportTypeOptions,
  schemeReportApplicableUserOptions,
} from '@/features/reports/mockSchemeReports'
import type { SchemeReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

async function getSchemeReports(): Promise<SchemeReportEntry[]> {
  return Promise.resolve(mockSchemeReports)
}

async function getSchemeReportDetail(id: string): Promise<SchemeReportEntry | undefined> {
  return Promise.resolve(getSchemeReportById(id))
}

async function getSchemeReportKpis() {
  return Promise.resolve(schemeReportKpis)
}

async function getSchemeReportFilterOptions() {
  return Promise.resolve({
    typeOptions: schemeReportTypeOptions,
    applicableUserOptions: schemeReportApplicableUserOptions,
  })
}

export const schemeReportsService = {
  getSchemeReports,
  getSchemeReportDetail,
  getSchemeReportKpis,
  getSchemeReportFilterOptions,
}
