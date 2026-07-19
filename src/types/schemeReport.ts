import type { Scheme, SchemeCategory, SchemeStatus } from '@/types/scheme'

export interface SchemeReportEntry {
  id: string
  scheme: Scheme
  schemeName: string
  schemeCategory: SchemeCategory
  applicableTo: string
  totalParticipants: number
  rewardPointsIssued: number
  startDate: string
  endDate: string | null
  status: SchemeStatus
}
