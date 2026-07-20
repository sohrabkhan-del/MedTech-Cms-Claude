export type { Chemist } from '@/types/chemist'
export type { PartnerStatus, PartnerZone } from '@/types/partner'

export interface ChemistKpis {
  chemistNetwork: number
  stockRefill: number
  pendingOutreach: number
  averageBasket: number
}

export interface ChemistListFilters {
  zones?: string[]
  statuses?: string[]
}
