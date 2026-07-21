import type { Chemist } from '@/types/chemist'
import { generatePartnerBase } from '@/features/partners/mockPartnerData'

export const mockChemists: Chemist[] = Array.from({ length: 38 }).map((_, index) => {
  const base = generatePartnerBase(index, 'chemist', 'Chemist')
  return {
    ...base,
    geoTagStatus: base.geoLock.active ? 'tagged' : 'pending',
  }
})

export function getChemistById(id: string): Chemist | undefined {
  return mockChemists.find((chemist) => chemist.id === id)
}

export const chemistKpis = {
  totalChemists: mockChemists.length,
  activeChemists: mockChemists.filter((c) => c.status === 'active').length,
  inactiveChemists: mockChemists.filter((c) => c.status === 'inactive').length,
  pendingApproval: mockChemists.filter((c) => c.status === 'pending').length,
}
