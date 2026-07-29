import type { SchemeReportEntry } from '@/types/schemeReport'
import {
  mockSchemes,
  schemeDealerTotal,
  schemeChemistTotal,
  schemeRegionOptions,
  schemePartnerTypeOptions,
} from '@/features/schemeManagement/mockSchemes'

function buildSchemeReport(
  scheme: (typeof mockSchemes)[number],
): SchemeReportEntry {
  return {
    id: `RPT-SCHEME-${scheme.id}`,
    scheme,
    schemeName: scheme.name,
    schemeType: scheme.type,
    regions: scheme.regions,
    partnerTypes: scheme.partnerTypes.join(', '),
    dealerTotal: schemeDealerTotal(scheme),
    chemistTotal: schemeChemistTotal(scheme),
    enrolledPartners:
      scheme.partners.dealer.length + scheme.partners.chemist.length,
    startDate: scheme.startDate,
    endDate: scheme.endDate,
  }
}

export const mockSchemeReports: SchemeReportEntry[] =
  mockSchemes.map(buildSchemeReport)

export function getSchemeReportById(id: string): SchemeReportEntry | undefined {
  return mockSchemeReports.find((entry) => entry.id === id)
}

export const schemeReportKpis = {
  totalSchemes: mockSchemeReports.length,
  totalEnrolledPartners: mockSchemeReports.reduce(
    (sum, r) => sum + r.enrolledPartners,
    0,
  ),
  totalDealerPoints: mockSchemeReports.reduce(
    (sum, r) => sum + r.dealerTotal,
    0,
  ),
  totalChemistPoints: mockSchemeReports.reduce(
    (sum, r) => sum + r.chemistTotal,
    0,
  ),
}

export const schemeReportRegionOptions = schemeRegionOptions
export const schemeReportPartnerTypeOptions = schemePartnerTypeOptions
