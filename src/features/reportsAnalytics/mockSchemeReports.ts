import type { SchemeReportEntry } from '@/types/schemeReport'
import { mockSchemes, schemeApplicableUserOptions, schemeTypeOptions } from '@/features/schemeManagement/mockSchemes'

function buildSchemeReport(scheme: (typeof mockSchemes)[number]): SchemeReportEntry {
  return {
    id: `RPT-SCHEME-${scheme.id}`,
    scheme,
    schemeName: scheme.schemeName,
    schemeCategory: scheme.schemeCategory,
    applicableTo: scheme.applicableUsers.join(', '),
    totalParticipants: scheme.totalParticipants,
    rewardPointsIssued: scheme.rewardPointsIssued,
    startDate: scheme.startDate,
    endDate: scheme.endDate,
    status: scheme.status,
  }
}

export const mockSchemeReports: SchemeReportEntry[] = mockSchemes.map(buildSchemeReport)

export function getSchemeReportById(id: string): SchemeReportEntry | undefined {
  return mockSchemeReports.find((entry) => entry.id === id)
}

export const schemeReportKpis = {
  totalSchemes: mockSchemeReports.length,
  activeSchemes: mockSchemeReports.filter((r) => r.status === 'active').length,
  totalParticipants: mockSchemeReports.reduce((sum, r) => sum + r.totalParticipants, 0),
  rewardPointsIssued: mockSchemeReports.reduce((sum, r) => sum + r.rewardPointsIssued, 0),
}

export const schemeReportTypeOptions = schemeTypeOptions
export const schemeReportApplicableUserOptions = schemeApplicableUserOptions
