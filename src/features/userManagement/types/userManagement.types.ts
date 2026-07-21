export type { Dealer } from '@/types/dealer'
export type { PartnerZone, PartnerStatus, OnboardedBy, PartnerBase } from '@/types/partner'
export { dealerFormSchema, dealerFormDefaults, type DealerFormValues } from '@/features/userManagement/dealerFormSchema'
export type {
  ApprovalRequest,
  RequestType,
  RegisteredBy,
  ApprovalStatus,
  GeoVerificationStatus,
  DocumentVerificationStatus,
  RequestDocument,
} from '@/types/approvalRequest'
export type { Chemist } from '@/types/chemist'

export interface ChemistKpis {
  totalChemists: number
  activeChemists: number
  inactiveChemists: number
  pendingApproval: number
}

export interface ChemistListFilters {
  zones?: string[]
  statuses?: string[]
}
