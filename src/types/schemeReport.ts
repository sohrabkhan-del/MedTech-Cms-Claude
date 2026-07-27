import type { Scheme, SchemeType } from '@/types/scheme'
import type { PartnerZone } from '@/types/partner'

export interface SchemeReportEntry {
  id: string
  scheme: Scheme
  schemeName: string
  schemeType: SchemeType
  regions: PartnerZone[]
  partnerTypes: string
  dealerTotal: number
  chemistTotal: number
  enrolledPartners: number
  startDate: string
  endDate: string | null
}
