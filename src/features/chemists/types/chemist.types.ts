export type { Chemist } from '@/types/chemist'
export type { PartnerStatus, PartnerZone } from '@/types/partner'

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
